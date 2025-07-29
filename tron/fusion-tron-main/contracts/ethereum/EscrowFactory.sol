// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Enhanced Escrow Factory for 1inch Fusion+ Tron Challenge
 * @notice Production-ready HTLC contract with MEV protection and advanced features
 * @dev Ethereum Sepolia implementation for cross-chain swaps with Tron Nile
 */
contract EscrowFactory is ReentrancyGuard, Ownable {
    
    // ============ STATE VARIABLES ============
    
    struct Escrow {
        address initiator;      // User who creates the escrow
        address resolver;       // Resolver who will process the swap
        address token;          // Token address (address(0) for ETH)
        uint256 amount;         // Amount of tokens/ETH to swap
        uint256 safetyDeposit;  // Resolver's safety deposit in ETH
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
    
    // Network-specific constants
    uint64 public constant FINALITY_BLOCKS = 20;  // Ethereum Sepolia: 20 blocks ≈ 4 minutes
    uint64 public constant MIN_CANCEL_DELAY = 1800; // 30 minutes minimum
    uint256 public constant MIN_SAFETY_DEPOSIT = 0.001 ether; // Minimum resolver deposit
    
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
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ MAIN FUNCTIONS ============
    
    /**
     * @notice Create a new cross-chain escrow
     * @param resolver Address of the resolver who will process this swap
     * @param token Token address (address(0) for ETH)
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
            // Handle ETH escrow
            if (msg.value < amount + MIN_SAFETY_DEPOSIT) revert InsufficientSafetyDeposit();
            safetyDeposit = msg.value - amount;
        } else {
            // Handle ERC20 escrow
            if (msg.value < MIN_SAFETY_DEPOSIT) revert InsufficientSafetyDeposit();
            safetyDeposit = msg.value;
            
            // Transfer tokens from user to escrow
            IERC20(token).transferFrom(msg.sender, address(this), amount);
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
            // Transfer ETH
            (bool success1, ) = payable(escrow.resolver).call{value: escrow.amount}("");
            if (!success1) revert TransferFailed();
            
            // Return safety deposit to resolver
            (bool success2, ) = payable(escrow.resolver).call{value: escrow.safetyDeposit}("");
            if (!success2) revert TransferFailed();
        } else {
            // Transfer ERC20 tokens
            IERC20(escrow.token).transfer(escrow.resolver, escrow.amount);
            
            // Return safety deposit in ETH to resolver
            (bool success, ) = payable(escrow.resolver).call{value: escrow.safetyDeposit}("");
            if (!success) revert TransferFailed();
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
            // Return ETH to initiator
            (bool success1, ) = payable(escrow.initiator).call{value: escrow.amount}("");
            if (!success1) revert TransferFailed();
            
            // Return safety deposit to resolver
            (bool success2, ) = payable(escrow.resolver).call{value: escrow.safetyDeposit}("");
            if (!success2) revert TransferFailed();
        } else {
            // Return ERC20 tokens to initiator
            IERC20(escrow.token).transfer(escrow.initiator, escrow.amount);
            
            // Return safety deposit to resolver
            (bool success, ) = payable(escrow.resolver).call{value: escrow.safetyDeposit}("");
            if (!success) revert TransferFailed();
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
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @notice Emergency function to rescue stuck funds (owner only)
     * @dev Only callable after a long delay to prevent abuse
     * @param escrowId The escrow to rescue funds from
     */
    function emergencyRescue(bytes32 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        
        // Only rescue funds if escrow is old and not completed
        require(
            block.timestamp > escrow.createdAt + 7 days &&
            !escrow.completed,
            "Emergency rescue not available"
        );
        
        // Mark as cancelled
        escrow.cancelled = true;
        
        // Return all funds to initiator
        if (escrow.token == address(0)) {
            (bool success, ) = payable(escrow.initiator).call{
                value: escrow.amount + escrow.safetyDeposit
            }("");
            require(success, "Transfer failed");
        } else {
            IERC20(escrow.token).transfer(escrow.initiator, escrow.amount);
            (bool success, ) = payable(escrow.initiator).call{value: escrow.safetyDeposit}("");
            require(success, "Transfer failed");
        }
        
        emit EscrowCancelled(escrowId, escrow.initiator);
    }
} 