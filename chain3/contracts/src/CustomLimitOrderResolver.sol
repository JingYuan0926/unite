// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// Minimal type definitions to avoid import conflicts
type TakerTraits is uint256;

// Custom Address type with get() method to avoid conflicts
type OrderAddress is uint256;

library OrderAddressLib {
    function get(OrderAddress addr) internal pure returns (address) {
        return address(uint160(OrderAddress.unwrap(addr)));
    }
}

interface IOrderMixin {
    struct Order {
        uint256 salt;
        OrderAddress maker;
        OrderAddress receiver;
        OrderAddress makerAsset;
        OrderAddress takerAsset;
        uint256 makingAmount;
        uint256 takingAmount;
        uint256 makerTraits;
    }
    
    function hashOrder(Order calldata order) external view returns(bytes32 orderHash);
    function fillOrder(
        Order calldata order,
        bytes32 r,
        bytes32 vs,
        uint256 amount,
        TakerTraits takerTraits
    ) external returns(uint256, uint256, bytes32);
}

library TakerTraitsLib {
    // Empty implementation for now - just to satisfy using statement
}

/**
 * @title CustomLimitOrderResolver
 * @notice Custom resolver for 1inch Limit Order Protocol with partial fill capability
 * @dev Integrates with cross-chain escrow system for atomic swaps
 */
contract CustomLimitOrderResolver is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using TakerTraitsLib for TakerTraits;
    using OrderAddressLib for OrderAddress;

    // Events
    event OrderResolved(
        bytes32 indexed orderHash,
        address indexed maker,
        address indexed taker,
        uint256 makingAmount,
        uint256 takingAmount,
        bool isPartialFill
    );

    event PartialFillCreated(
        bytes32 indexed orderHash,
        uint256 fillPercentage,
        uint256 filledAmount,
        uint256 remainingAmount
    );

    event EscrowIntegration(
        bytes32 indexed orderHash,
        address indexed escrow,
        uint256 amount
    );

    // Structs
    struct PartialFillOrder {
        bytes32 orderHash;
        uint256 totalAmount;
        uint256 filledAmount;
        uint256 remainingAmount;
        uint256 fillPercentage;
        bool isActive;
        address escrowAddress;
    }

    struct ResolverConfig {
        uint256 minFillPercentage;      // Minimum fill percentage (e.g., 10%)
        uint256 maxFillPercentage;      // Maximum fill percentage (e.g., 90%)
        uint256 defaultFillPercentage;  // Default fill percentage (e.g., 50%)
        bool partialFillEnabled;        // Global partial fill toggle
    }

    // State variables
    address public immutable limitOrderProtocol;
    ResolverConfig public config;
    
    // Mapping to track partial fill orders
    mapping(bytes32 => PartialFillOrder) public partialFillOrders;
    mapping(address => mapping(bytes32 => uint256)) public userOrderFills;
    
    // Array to track all active partial fill orders
    bytes32[] public activePartialFillOrders;

    // Constants
    uint256 public constant MAX_PERCENTAGE = 100;
    uint256 public constant MIN_PERCENTAGE = 1;

    constructor(
        address _limitOrderProtocol,
        address _owner
    ) Ownable(_owner) {
        require(_limitOrderProtocol != address(0), "Invalid LOP address");
        limitOrderProtocol = _limitOrderProtocol;
        
        // Initialize default configuration
        config = ResolverConfig({
            minFillPercentage: 10,
            maxFillPercentage: 90,
            defaultFillPercentage: 50,
            partialFillEnabled: true
        });
    }

    /**
     * @notice Updates resolver configuration
     * @param newConfig New configuration parameters
     */
    function updateConfig(ResolverConfig calldata newConfig) external onlyOwner {
        require(newConfig.minFillPercentage >= MIN_PERCENTAGE, "Min percentage too low");
        require(newConfig.maxFillPercentage <= MAX_PERCENTAGE, "Max percentage too high");
        require(newConfig.minFillPercentage < newConfig.maxFillPercentage, "Invalid percentage range");
        require(newConfig.defaultFillPercentage >= newConfig.minFillPercentage && 
                newConfig.defaultFillPercentage <= newConfig.maxFillPercentage, "Invalid default percentage");
        
        config = newConfig;
    }

    /**
     * @notice Resolves a limit order with full fill
     * @param order The limit order to resolve
     * @param r R component of signature
     * @param vs VS component of signature
     * @param amount Taker amount to fill
     * @param takerTraits Taker traits for the fill
     * @return makingAmount Actual amount transferred from maker to taker
     * @return takingAmount Actual amount transferred from taker to maker
     * @return orderHash Hash of the filled order
     */
    function resolveOrder(
        IOrderMixin.Order calldata order,
        bytes32 r,
        bytes32 vs,
        uint256 amount,
        TakerTraits takerTraits
    ) external nonReentrant returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash) {
        // Calculate order hash
        orderHash = IOrderMixin(limitOrderProtocol).hashOrder(order);
        
        // Fill the order through 1inch LOP
        (makingAmount, takingAmount, ) = IOrderMixin(limitOrderProtocol).fillOrder(
            order,
            r,
            vs,
            amount,
            takerTraits
        );

        emit OrderResolved(
            orderHash,
            order.maker.get(),
            msg.sender,
            makingAmount,
            takingAmount,
            false
        );

        return (makingAmount, takingAmount, orderHash);
    }

    /**
     * @notice Resolves a limit order with partial fill capability
     * @param order The limit order to resolve
     * @param r R component of signature
     * @param vs VS component of signature
     * @param fillPercentage Percentage of the order to fill (1-100)
     * @param takerTraits Taker traits for the fill
     * @param escrowAddress Optional escrow address for cross-chain integration
     * @return makingAmount Actual amount transferred from maker to taker
     * @return takingAmount Actual amount transferred from taker to maker
     * @return orderHash Hash of the filled order
     */
    function resolvePartialOrder(
        IOrderMixin.Order calldata order,
        bytes32 r,
        bytes32 vs,
        uint256 fillPercentage,
        TakerTraits takerTraits,
        address escrowAddress
    ) external nonReentrant returns (uint256 makingAmount, uint256 takingAmount, bytes32 orderHash) {
        require(config.partialFillEnabled, "Partial fill disabled");
        require(fillPercentage >= config.minFillPercentage && fillPercentage <= config.maxFillPercentage, 
                "Invalid fill percentage");

        // Calculate order hash
        orderHash = IOrderMixin(limitOrderProtocol).hashOrder(order);
        
        // Calculate partial amount
        uint256 partialAmount = (order.takingAmount * fillPercentage) / MAX_PERCENTAGE;
        
        // Check if this is a new partial fill order or continuation
        PartialFillOrder storage partialOrder = partialFillOrders[orderHash];
        
        if (!partialOrder.isActive) {
            // Create new partial fill order
            partialOrder.orderHash = orderHash;
            partialOrder.totalAmount = order.takingAmount;
            partialOrder.filledAmount = 0;
            partialOrder.remainingAmount = order.takingAmount;
            partialOrder.fillPercentage = fillPercentage;
            partialOrder.isActive = true;
            partialOrder.escrowAddress = escrowAddress;
            
            activePartialFillOrders.push(orderHash);
        }

        // Ensure we don't overfill
        require(partialAmount <= partialOrder.remainingAmount, "Exceeds remaining amount");

        // Fill the partial order through 1inch LOP
        (makingAmount, takingAmount, ) = IOrderMixin(limitOrderProtocol).fillOrder(
            order,
            r,
            vs,
            partialAmount,
            takerTraits
        );

        // Update partial fill tracking
        partialOrder.filledAmount += takingAmount;
        partialOrder.remainingAmount -= takingAmount;
        userOrderFills[msg.sender][orderHash] += takingAmount;

        // Check if order is fully filled
        if (partialOrder.remainingAmount == 0) {
            partialOrder.isActive = false;
            _removeFromActiveOrders(orderHash);
        }

        // Integrate with escrow if specified
        if (escrowAddress != address(0)) {
            _integrateWithEscrow(escrowAddress, makingAmount, orderHash);
        }

        emit PartialFillCreated(
            orderHash,
            fillPercentage,
            takingAmount,
            partialOrder.remainingAmount
        );

        emit OrderResolved(
            orderHash,
            order.maker.get(),
            msg.sender,
            makingAmount,
            takingAmount,
            true
        );

        return (makingAmount, takingAmount, orderHash);
    }

    /**
     * @notice Creates a new partial fill for an existing order
     * @param orderHash Hash of the existing order
     * @param newFillPercentage New fill percentage to create
     * @return success Whether the partial fill was created successfully
     */
    function createAdditionalPartialFill(
        bytes32 orderHash,
        uint256 newFillPercentage
    ) external returns (bool success) {
        require(config.partialFillEnabled, "Partial fill disabled");
        require(newFillPercentage >= config.minFillPercentage && 
                newFillPercentage <= config.maxFillPercentage, "Invalid fill percentage");

        PartialFillOrder storage partialOrder = partialFillOrders[orderHash];
        require(partialOrder.isActive, "Order not active for partial fills");
        require(partialOrder.remainingAmount > 0, "No remaining amount to fill");

        // Calculate new partial amount
        uint256 newPartialAmount = (partialOrder.remainingAmount * newFillPercentage) / MAX_PERCENTAGE;
        require(newPartialAmount > 0, "Calculated amount is zero");

        // Update fill percentage for future fills
        partialOrder.fillPercentage = newFillPercentage;

        emit PartialFillCreated(
            orderHash,
            newFillPercentage,
            0, // No actual fill yet, just preparation
            partialOrder.remainingAmount
        );

        return true;
    }

    /**
     * @notice Integrates resolver with escrow system for cross-chain swaps
     * @param escrowAddress Address of the escrow contract
     * @param amount Amount to deposit into escrow
     * @param orderHash Associated order hash
     */
    function _integrateWithEscrow(
        address escrowAddress,
        uint256 amount,
        bytes32 orderHash
    ) private {
        require(escrowAddress != address(0), "Invalid escrow address");
        
        // Emit integration event (actual escrow integration would depend on escrow interface)
        emit EscrowIntegration(orderHash, escrowAddress, amount);
        
        // In a real implementation, this would call escrow deposit functions
        // For example: IEscrow(escrowAddress).deposit{value: amount}();
    }

    /**
     * @notice Removes order hash from active partial fill orders array
     * @param orderHash Order hash to remove
     */
    function _removeFromActiveOrders(bytes32 orderHash) private {
        for (uint256 i = 0; i < activePartialFillOrders.length; i++) {
            if (activePartialFillOrders[i] == orderHash) {
                activePartialFillOrders[i] = activePartialFillOrders[activePartialFillOrders.length - 1];
                activePartialFillOrders.pop();
                break;
            }
        }
    }

    /**
     * @notice Gets partial fill order information
     * @param orderHash Hash of the order
     * @return partialOrder Partial fill order details
     */
    function getPartialFillOrder(bytes32 orderHash) external view returns (PartialFillOrder memory partialOrder) {
        return partialFillOrders[orderHash];
    }

    /**
     * @notice Gets all active partial fill order hashes
     * @return orderHashes Array of active order hashes
     */
    function getActivePartialFillOrders() external view returns (bytes32[] memory orderHashes) {
        return activePartialFillOrders;
    }

    /**
     * @notice Gets user's fill amount for a specific order
     * @param user User address
     * @param orderHash Order hash
     * @return fillAmount Amount filled by the user
     */
    function getUserOrderFill(address user, bytes32 orderHash) external view returns (uint256 fillAmount) {
        return userOrderFills[user][orderHash];
    }

    /**
     * @notice Calculates recommended partial fill amount
     * @param totalAmount Total order amount
     * @param fillPercentage Fill percentage
     * @return partialAmount Calculated partial amount
     */
    function calculatePartialAmount(
        uint256 totalAmount,
        uint256 fillPercentage
    ) external pure returns (uint256 partialAmount) {
        require(fillPercentage > 0 && fillPercentage <= MAX_PERCENTAGE, "Invalid percentage");
        return (totalAmount * fillPercentage) / MAX_PERCENTAGE;
    }

    /**
     * @notice Emergency function to cancel resolver operations
     * @param orderHash Order hash to cancel
     */
    function emergencyCancel(bytes32 orderHash) external onlyOwner {
        PartialFillOrder storage partialOrder = partialFillOrders[orderHash];
        if (partialOrder.isActive) {
            partialOrder.isActive = false;
            _removeFromActiveOrders(orderHash);
        }
    }

    /**
     * @notice Allows owner to withdraw stuck tokens
     * @param token Token address (use address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    // Receive ETH
    receive() external payable {}
}