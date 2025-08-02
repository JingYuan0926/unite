// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./official-lop/LimitOrderProtocol.sol";
import "./official-escrow/interfaces/IEscrowFactory.sol";
import "./official-escrow/interfaces/IBaseEscrow.sol";
import "./official-lop/interfaces/IOrderMixin.sol";
import "./official-escrow/libraries/TimelocksLib.sol";

/**
 * @title DemoResolverV2
 * @notice A permissionless solver contract that integrates with the official 1inch LOP
 * @dev This contract acts as our own resolver to execute atomic swaps using the real
 * LimitOrderProtocol while bypassing whitelisting restrictions
 */
contract DemoResolverV2 {
    using TimelocksLib for Timelocks;

    LimitOrderProtocol public immutable LOP;
    IEscrowFactory public immutable ESCROW_FACTORY;

    event SwapExecuted(
        address indexed maker,
        address indexed escrow,
        bytes32 indexed orderHash,
        uint256 amount,
        uint256 safetyDeposit
    );

    event EscrowCreated(
        address indexed escrow, 
        bytes32 indexed orderHash
    );

    constructor(address payable _lop, address _escrowFactory) {
        require(_lop != address(0), "Invalid LOP address");
        require(_escrowFactory != address(0), "Invalid EscrowFactory address");
        
        LOP = LimitOrderProtocol(_lop);
        ESCROW_FACTORY = IEscrowFactory(_escrowFactory);
    }

    /**
     * @notice Execute atomic swap using official LOP contract
     * @dev Creates escrow first, then fills order via LOP
     * @param immutables The escrow immutables struct
     * @param order The 1inch order to fill
     * @param r The r component of the order signature
     * @param vs The vs component of the order signature  
     * @param amount The amount to fill
     * @param takerTraits The taker traits for the order
     * @param args Additional arguments for the order
     */
    function executeAtomicSwap(
        IBaseEscrow.Immutables calldata immutables,
        IOrderMixin.Order calldata order,
        bytes32 r,
        bytes32 vs,
        uint256 amount,
        TakerTraits takerTraits,
        bytes calldata args
    ) external payable {
        // Validate the value sent matches the expected amount
        require(
            msg.value == amount + immutables.safetyDeposit,
            "Invalid ETH: must equal amount + safetyDeposit"
        );

        // Set deployment timestamp for timelocks
        IBaseEscrow.Immutables memory immutablesMem = immutables;
        immutablesMem.timelocks = TimelocksLib.setDeployedAt(immutables.timelocks, block.timestamp);

        // Calculate the escrow address
        address escrowAddress = ESCROW_FACTORY.addressOfEscrowSrc(immutablesMem);

        // Send safety deposit to the computed escrow address
        (bool success,) = payable(escrowAddress).call{value: immutablesMem.safetyDeposit}("");
        require(success, "Safety deposit transfer failed");

        // Fill the order through the official LOP
        // We'll use the official LOP's fillOrderArgs function
        try LOP.fillOrderArgs(order, r, vs, amount, takerTraits, args) {
            // Order successfully filled
            emit EscrowCreated(escrowAddress, immutables.orderHash);
            
            emit SwapExecuted(
                order.maker.get(),
                escrowAddress,
                immutables.orderHash,
                amount,
                immutablesMem.safetyDeposit
            );
        } catch (bytes memory reason) {
            // If LOP order fails, we need to refund the safety deposit
            // In a real implementation, this would be more sophisticated
            revert(string(reason));
        }
    }

    /**
     * @notice Create escrow destination for Tron-side completion
     * @dev This mirrors the official Resolver's deployDst function
     * @param dstImmutables The destination escrow immutables
     * @param srcCancellationTimestamp The source cancellation timestamp
     */
    function createDstEscrow(
        IBaseEscrow.Immutables calldata dstImmutables, 
        uint256 srcCancellationTimestamp
    ) external payable {
        ESCROW_FACTORY.createDstEscrow{value: msg.value}(dstImmutables, srcCancellationTimestamp);
    }

    /**
     * @notice Simple swap execution without LOP integration (for testing)
     * @dev This is the fallback method that just locks ETH
     * @param orderHash The order hash
     * @param amount The swap amount
     * @param safetyDeposit The safety deposit
     * @param maker The maker address
     */
    function executeSimpleSwap(
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

        // Lock the ETH in this contract
        emit SwapExecuted(
            maker,
            address(this), // Using this contract as the "escrow" for demo
            orderHash,
            amount,
            safetyDeposit
        );
    }

    /**
     * @notice Withdraw ETH from the demo escrow
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
     * @notice Get the ETH balance locked in this contract
     * @return The current ETH balance
     */
    function getLockedBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Emergency function to recover ETH
     */
    function recoverETH() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to recover");
        
        payable(msg.sender).transfer(balance);
    }

    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {
        // Contract can receive ETH for atomic swaps
    }
}