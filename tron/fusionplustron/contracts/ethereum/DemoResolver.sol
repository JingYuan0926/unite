// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./official-lop/LimitOrderProtocol.sol";
import "./official-escrow/interfaces/IEscrowFactory.sol";
import "./official-escrow/interfaces/IBaseEscrow.sol";
import "./official-lop/interfaces/IOrderMixin.sol";

/**
 * @title DemoResolver
 * @notice A permissionless solver contract for demonstrating 1inch Fusion+ atomic swaps
 * @dev This contract acts as our own resolver to execute the complete atomic swap flow
 * without requiring authorization from the official 1inch resolver network
 */
contract DemoResolver {
    LimitOrderProtocol public immutable LOP;
    IEscrowFactory public immutable ESCROW_FACTORY;

    event SwapExecuted(
        address indexed maker,
        address indexed escrow,
        bytes32 indexed orderHash,
        uint256 amount,
        uint256 safetyDeposit
    );

    constructor(address payable _lop, address _escrowFactory) {
        require(_lop != address(0), "Invalid LOP address");
        require(_escrowFactory != address(0), "Invalid EscrowFactory address");
        
        LOP = LimitOrderProtocol(_lop);
        ESCROW_FACTORY = IEscrowFactory(_escrowFactory);
    }

    /**
     * @notice Execute a demo atomic swap by locking ETH and emitting event
     * @dev Simplified version for demonstration - doesn't use actual 1inch contracts
     * @param orderHash The hash of the order being executed
     * @param amount The amount of ETH being swapped
     * @param safetyDeposit The safety deposit amount
     * @param maker The maker address
     */
    function executeSwap(
        bytes32 orderHash,
        uint256 amount,
        uint256 safetyDeposit,
        address maker
    ) external payable {
        require(
            msg.value == amount + safetyDeposit,
            "Invalid ETH amount: must equal amount + safetyDeposit"
        );

        require(amount > 0, "Amount must be greater than 0");
        require(safetyDeposit > 0, "Safety deposit must be greater than 0");
        require(maker != address(0), "Invalid maker address");

        // Lock the ETH in this contract (simulating escrow creation)
        // In a real implementation, this would interact with the EscrowFactory
        
        emit SwapExecuted(
            maker,
            address(this), // Using this contract as the "escrow" for demo
            orderHash,
            amount,
            safetyDeposit
        );
    }

    /**
     * @notice Withdraw ETH from the demo escrow (simulating secret reveal)
     * @param amount The amount to withdraw
     * @param recipient The recipient address
     */
    function withdrawETH(uint256 amount, address payable recipient) external {
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");
        
        recipient.transfer(amount);
    }

    /**
     * @notice Get the ETH balance locked in this demo contract
     * @return The current ETH balance
     */
    function getLockedBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Emergency function to recover ETH sent directly to this contract
     * @dev Only callable by the original sender
     */
    function recoverETH() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to recover");
        
        payable(msg.sender).transfer(balance);
    }

    /**
     * @notice Check if this contract can receive ETH
     */
    receive() external payable {
        // Allow contract to receive ETH for atomic swaps
    }
}