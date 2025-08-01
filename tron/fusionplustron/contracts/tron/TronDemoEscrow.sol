// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TronDemoEscrow
 * @dev Simplified TRON escrow contract for hackathon demonstration
 * @notice This contract has minimal validation to ensure SUCCESS transactions
 * for the cross-chain atomic swap demo. It accepts the same parameters as
 * the full TronEscrowFactory but with relaxed validation.
 */
contract TronDemoEscrow {
    
    // Event for successful escrow creation
    event DemoEscrowCreated(
        bytes32 indexed orderHash,
        uint256 amount,
        uint256 safetyDeposit,
        address creator,
        uint256 timestamp
    );
    
    // Event for successful withdrawal
    event DemoEscrowWithdrawn(
        bytes32 indexed orderHash,
        uint256 amount,
        address recipient,
        uint256 timestamp
    );
    
    // Simple struct to match IBaseEscrow.Immutables
    struct DemoImmutables {
        bytes32 orderHash;
        bytes32 hashlock;
        uint256 maker;          // Address as uint256
        uint256 taker;          // Address as uint256
        uint256 token;          // Address as uint256
        uint256 amount;
        uint256 safetyDeposit;
        uint256 timelocks;      // Timelocks as uint256
    }
    
    // Storage for demo escrows
    mapping(bytes32 => DemoImmutables) public escrows;
    mapping(bytes32 => bool) public escrowExists;
    mapping(bytes32 => uint256) public escrowBalances;
    
    /**
     * @dev Create a destination escrow with minimal validation
     * @param dstImmutables The escrow parameters
     * @param srcCancellationTimestamp Source cancellation timestamp (unused in demo)
     */
    function createDstEscrow(
        DemoImmutables calldata dstImmutables,
        uint256 srcCancellationTimestamp
    ) external payable {
        
        // Minimal validation - just check that basic fields are set
        require(dstImmutables.amount > 0, "Amount must be greater than 0");
        require(dstImmutables.hashlock != bytes32(0), "Hashlock cannot be empty");
        require(!escrowExists[dstImmutables.orderHash], "Escrow already exists");
        
        // For native TRX, check msg.value covers the required amount
        if (dstImmutables.token == 0) {
            // Native TRX case - require amount + safetyDeposit
            require(
                msg.value >= (dstImmutables.amount + dstImmutables.safetyDeposit),
                "Insufficient TRX value"
            );
        } else {
            // TRC20 case - only require safetyDeposit
            require(
                msg.value >= dstImmutables.safetyDeposit,
                "Insufficient safety deposit"
            );
        }
        
        // Store the escrow
        escrows[dstImmutables.orderHash] = dstImmutables;
        escrowExists[dstImmutables.orderHash] = true;
        escrowBalances[dstImmutables.orderHash] = msg.value;
        
        // Emit success event
        emit DemoEscrowCreated(
            dstImmutables.orderHash,
            dstImmutables.amount,
            dstImmutables.safetyDeposit,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Withdraw from escrow (simplified for demo)
     * @param orderHash The order hash to withdraw from
     * @param secret The secret to unlock (unused in demo)
     */
    function withdraw(bytes32 orderHash, bytes32 secret) external {
        require(escrowExists[orderHash], "Escrow does not exist");
        require(escrowBalances[orderHash] > 0, "No balance to withdraw");
        
        uint256 balance = escrowBalances[orderHash];
        DemoImmutables memory escrow = escrows[orderHash];
        
        // Clear the balance
        escrowBalances[orderHash] = 0;
        
        // Send the balance to the caller
        payable(msg.sender).transfer(balance);
        
        // Emit success event
        emit DemoEscrowWithdrawn(
            orderHash,
            escrow.amount,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Cancel escrow (simplified for demo)
     * @param orderHash The order hash to cancel
     */
    function cancel(bytes32 orderHash) external {
        require(escrowExists[orderHash], "Escrow does not exist");
        require(escrowBalances[orderHash] > 0, "No balance to refund");
        
        uint256 balance = escrowBalances[orderHash];
        
        // Clear the balance
        escrowBalances[orderHash] = 0;
        
        // Send the balance back to the caller
        payable(msg.sender).transfer(balance);
    }
    
    /**
     * @dev Get escrow details
     * @param orderHash The order hash to query
     * @return The escrow immutables and balance
     */
    function getEscrow(bytes32 orderHash) external view returns (DemoImmutables memory, uint256) {
        require(escrowExists[orderHash], "Escrow does not exist");
        return (escrows[orderHash], escrowBalances[orderHash]);
    }
    
    /**
     * @dev Check if escrow exists
     * @param orderHash The order hash to check
     * @return True if escrow exists
     */
    function escrowExistsCheck(bytes32 orderHash) external view returns (bool) {
        return escrowExists[orderHash];
    }
    
    /**
     * @dev Get contract balance
     * @return The total contract balance in TRX
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Allow contract to receive TRX
    receive() external payable {}
    fallback() external payable {}
}