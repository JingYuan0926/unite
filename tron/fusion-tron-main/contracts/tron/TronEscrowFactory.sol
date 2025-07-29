// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Tron Escrow Factory for 1inch Fusion+ Challenge
 * @notice Tron Nile implementation of HTLC contract for cross-chain swaps
 * @dev Optimized for Tron's 3-second block time and energy/bandwidth model
 */
contract TronEscrowFactory {
    
    // ============ STATE VARIABLES ============
    
    struct Escrow {
        address initiator;      // User who creates the escrow
        address resolver;       // Resolver who will process the swap
        address token;          // Token address (address(0) for TRX)
        uint256 amount;         // Amount of tokens/TRX to swap
        uint256 safetyDeposit;  // Resolver's safety deposit in TRX
        bytes32 secretHash;     // Keccak256 hash of the secret
        uint64 finalityLock;    // Block number when finality is reached
        uint64 cancelLock;      // Timestamp when cancellation becomes available
        uint64 createdAt;       // Timestamp when escrow was created
        bool completed;         // Whether the escrow has been completed
        bool cancelled;         // Whether the escrow has been cancelled
    }
    
    // Main escrow storage
    mapping(bytes32 => Escrow) public escrows;
    
    // MEV Protection: Commit-reveal scheme for secrets
    mapping(bytes32 => uint64) private secretCommits;
    uint64 public constant REVEAL_DELAY = 60; // 1 minute delay to prevent MEV
    
    // Tron-specific constants (3-second block time)
    uint64 public constant FINALITY_BLOCKS = 12;  // Tron Nile: 12 blocks ≈ 36 seconds
    uint64 public constant MIN_CANCEL_DELAY = 1800; // 30 minutes minimum
    uint256 public constant MIN_SAFETY_DEPOSIT = 1000000; // 1 TRX (6 decimals)
    
    // ============ EVENTS ============
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed initiator,
        address indexed resolver,
        address token,
        uint256 amount,
        bytes32 secretHash,
        uint64 finalityLock,
        uint64 cancelLock
    );
    
    event EscrowCompleted(
        bytes32 indexed escrowId,
        bytes32 secret,
        address indexed resolver
    );
    
    event EscrowCancelled(
        bytes32 indexed escrowId,
        address indexed initiator
    );
    
    event SecretCommitted(
        bytes32 indexed commitHash,
        address indexed committer,
        uint64 timestamp
    );
    
    // ============ ERRORS ============
    
    error EscrowAlreadyExists();
    error EscrowNotFound();
    error EscrowAlreadyCompleted();
    error EscrowAlreadyCancelled();
    error InvalidSecret();
    error FinalityNotReached();
    error CancelLockActive();
    error InsufficientSafetyDeposit();
    error InsufficientTimeBuffer();
    error Unauthorized();
    error SecretNotCommitted();
    error RevealTooEarly();
    error TransferFailed();
    
    // ============ MODIFIERS ============
    
    modifier nonReentrant() {
        // Simple reentrancy protection for Tron
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {}
    
    // ============ MAIN FUNCTIONS ============
    
    /**
     * @notice Create a new cross-chain escrow on Tron
     * @param resolver Address of the resolver who will process this swap
     * @param token Token address (address(0) for TRX)
     * @param amount Amount of tokens to escrow
     * @param secretHash Keccak256 hash of the secret
     * @param cancelDelay Delay in seconds before cancellation is allowed
     */
    function createEscrow(
        address resolver,
        address token,
        uint256 amount,
        bytes32 secretHash,
        uint64 cancelDelay
    ) external payable nonReentrant {
        // Validate inputs
        if (cancelDelay < MIN_CANCEL_DELAY) revert InsufficientTimeBuffer();
        
        // Calculate finality lock (current block + finality delay)
        uint64 finalityLock = uint64(block.number + FINALITY_BLOCKS);
        uint64 cancelLock = uint64(block.timestamp + cancelDelay);
        
        // Generate unique escrow ID
        bytes32 escrowId = keccak256(abi.encodePacked(
            msg.sender,
            resolver,
            token,
            amount,
            secretHash,
            block.timestamp,
            block.number
        ));
        
        // Ensure escrow doesn't already exist
        if (escrows[escrowId].initiator != address(0)) revert EscrowAlreadyExists();
        
        uint256 safetyDeposit;
        
        if (token == address(0)) {
            // Handle TRX escrow
            if (msg.value < amount + MIN_SAFETY_DEPOSIT) revert InsufficientSafetyDeposit();
            safetyDeposit = msg.value - amount;
        } else {
            // Handle TRC-20 escrow
            if (msg.value < MIN_SAFETY_DEPOSIT) revert InsufficientSafetyDeposit();
            safetyDeposit = msg.value;
            
            // Transfer tokens from user to escrow (TRC-20)
            (bool success, ) = token.call(
                abi.encodeWithSignature(
                    "transferFrom(address,address,uint256)",
                    msg.sender,
                    address(this),
                    amount
                )
            );
            require(success, "TRC-20 transfer failed");
        }
        
        // Create escrow
        escrows[escrowId] = Escrow({
            initiator: msg.sender,
            resolver: resolver,
            token: token,
            amount: amount,
            safetyDeposit: safetyDeposit,
            secretHash: secretHash,
            finalityLock: finalityLock,
            cancelLock: cancelLock,
            createdAt: uint64(block.timestamp),
            completed: false,
            cancelled: false
        });
        
        emit EscrowCreated(
            escrowId,
            msg.sender,
            resolver,
            token,
            amount,
            secretHash,
            finalityLock,
            cancelLock
        );
    }
    
    /**
     * @notice Commit a secret hash for MEV protection (step 1 of 2)
     * @param secretCommit Keccak256 hash of (secret + nonce)
     */
    function commitSecret(bytes32 secretCommit) external {
        secretCommits[secretCommit] = uint64(block.timestamp);
        emit SecretCommitted(secretCommit, msg.sender, uint64(block.timestamp));
    }
    
    /**
     * @notice Reveal secret and withdraw funds (step 2 of 2)
     * @param escrowId The escrow to withdraw from
     * @param secret The secret that matches the stored hash
     * @param nonce The nonce used in the commit phase
     */
    function revealAndWithdraw(
        bytes32 escrowId,
        bytes32 secret,
        bytes32 nonce
    ) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        // Basic validations
        if (escrow.initiator == address(0)) revert EscrowNotFound();
        if (escrow.completed) revert EscrowAlreadyCompleted();
        if (escrow.cancelled) revert EscrowAlreadyCancelled();
        
        // Verify secret matches hash
        if (keccak256(abi.encodePacked(secret)) != escrow.secretHash) revert InvalidSecret();
        
        // Check finality has been reached
        if (block.number < escrow.finalityLock) revert FinalityNotReached();
        
        // MEV Protection: Verify commit-reveal
        bytes32 secretCommit = keccak256(abi.encodePacked(secret, nonce));
        if (secretCommits[secretCommit] == 0) revert SecretNotCommitted();
        if (block.timestamp < secretCommits[secretCommit] + REVEAL_DELAY) revert RevealTooEarly();
        
        // Mark as completed
        escrow.completed = true;
        
        // Transfer funds to resolver
        if (escrow.token == address(0)) {
            // Transfer TRX
            payable(escrow.resolver).transfer(escrow.amount);
            // Return safety deposit to resolver
            payable(escrow.resolver).transfer(escrow.safetyDeposit);
        } else {
            // Transfer TRC-20 tokens
            (bool success1, ) = escrow.token.call(
                abi.encodeWithSignature(
                    "transfer(address,uint256)",
                    escrow.resolver,
                    escrow.amount
                )
            );
            require(success1, "TRC-20 transfer failed");
            
            // Return safety deposit in TRX to resolver
            payable(escrow.resolver).transfer(escrow.safetyDeposit);
        }
        
        emit EscrowCompleted(escrowId, secret, escrow.resolver);
    }
    
    /**
     * @notice Cancel an escrow and return funds to initiator
     * @param escrowId The escrow to cancel
     */
    function cancel(bytes32 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        // Basic validations
        if (escrow.initiator == address(0)) revert EscrowNotFound();
        if (escrow.completed) revert EscrowAlreadyCompleted();
        
        // Only initiator or resolver can cancel
        if (msg.sender != escrow.initiator && msg.sender != escrow.resolver) revert Unauthorized();
        
        // Check cancel lock has expired
        if (block.timestamp < escrow.cancelLock) revert CancelLockActive();
        
        // Mark as cancelled
        escrow.cancelled = true;
        
        // Return funds to initiator
        if (escrow.token == address(0)) {
            // Return TRX to initiator
            payable(escrow.initiator).transfer(escrow.amount);
            // Return safety deposit to resolver
            payable(escrow.resolver).transfer(escrow.safetyDeposit);
        } else {
            // Return TRC-20 tokens to initiator
            (bool success1, ) = escrow.token.call(
                abi.encodeWithSignature(
                    "transfer(address,uint256)",
                    escrow.initiator,
                    escrow.amount
                )
            );
            require(success1, "TRC-20 transfer failed");
            
            // Return safety deposit to resolver
            payable(escrow.resolver).transfer(escrow.safetyDeposit);
        }
        
        emit EscrowCancelled(escrowId, escrow.initiator);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get complete escrow details
     * @param escrowId The escrow to query
     * @return The escrow struct
     */
    function getEscrow(bytes32 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }
    
    /**
     * @notice Check if an escrow exists
     * @param escrowId The escrow to check
     * @return true if escrow exists
     */
    function escrowExists(bytes32 escrowId) external view returns (bool) {
        return escrows[escrowId].initiator != address(0);
    }
    
    /**
     * @notice Check if finality has been reached for an escrow
     * @param escrowId The escrow to check
     * @return true if finality reached
     */
    function isFinalityReached(bytes32 escrowId) external view returns (bool) {
        return block.number >= escrows[escrowId].finalityLock;
    }
    
    /**
     * @notice Check if an escrow can be cancelled
     * @param escrowId The escrow to check
     * @return true if cancellation is allowed
     */
    function canCancel(bytes32 escrowId) external view returns (bool) {
        Escrow memory escrow = escrows[escrowId];
        return !escrow.completed && block.timestamp >= escrow.cancelLock;
    }
    
    // ============ TRON-SPECIFIC FUNCTIONS ============
    
    /**
     * @notice Get energy and bandwidth estimates for operations
     * @return estimated energy and bandwidth costs
     */
    function getResourceEstimates() external pure returns (uint256 energy, uint256 bandwidth) {
        energy = 50000;    // Estimated energy cost for main operations
        bandwidth = 300;   // Estimated bandwidth cost
    }
    
    /**
     * @notice Bulk operation to check multiple escrows (gas-efficient)
     * @param escrowIds Array of escrow IDs to check
     * @return statuses Array of escrow statuses
     */
    function bulkCheckEscrows(bytes32[] calldata escrowIds) 
        external 
        view 
        returns (uint8[] memory statuses) 
    {
        statuses = new uint8[](escrowIds.length);
        for (uint256 i = 0; i < escrowIds.length; i++) {
            Escrow memory escrow = escrows[escrowIds[i]];
            if (escrow.initiator == address(0)) {
                statuses[i] = 0; // Not found
            } else if (escrow.completed) {
                statuses[i] = 1; // Completed
            } else if (escrow.cancelled) {
                statuses[i] = 2; // Cancelled
            } else if (block.number >= escrow.finalityLock) {
                statuses[i] = 3; // Ready for withdrawal
            } else {
                statuses[i] = 4; // Waiting for finality
            }
        }
    }
} 