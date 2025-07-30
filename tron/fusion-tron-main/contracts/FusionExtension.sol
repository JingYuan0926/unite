// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./limit-order-protocol/interfaces/IPostInteraction.sol";
import "./limit-order-protocol/interfaces/IOrderMixin.sol";
import "./ethereum/EscrowFactory.sol";
import {Address, AddressLib} from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";

/**
 * @title FusionExtension 
 * @notice LOP extension that creates escrows for cross-chain swaps via postInteraction hook
 * @dev Integrates 1inch Limit Order Protocol v4 with Fusion-Tron atomic swap system
 */
contract FusionExtension is IPostInteraction, Ownable, ReentrancyGuard {
    using AddressLib for Address;
    
    // ============ STRUCTS ============
    
    /**
     * @notice Fusion order parameters for cross-chain swaps
     * @dev Passed as extraData in LOP order filling
     */
    struct FusionOrderData {
        address srcToken;       // Source token address (ETH = address(0))
        address dstToken;       // Destination token address (TRX representation)
        uint256 srcChainId;     // Source chain ID (Ethereum Sepolia = 11155111)
        uint256 dstChainId;     // Destination chain ID (Tron Nile = 3448148188)
        bytes32 secretHash;     // Hash of the atomic swap secret
        uint64 timelock;        // Timelock duration in seconds
        uint256 safetyDeposit;  // Required safety deposit amount
        address resolver;       // Address that will resolve the swap
    }
    
    // ============ STATE VARIABLES ============
    
    /// @notice Address of the deployed Limit Order Protocol contract
    address public immutable LIMIT_ORDER_PROTOCOL;
    
    /// @notice Address of the Ethereum escrow factory
    EscrowFactory public immutable ESCROW_FACTORY;
    
    /// @notice Mapping to track created escrows by order hash
    mapping(bytes32 => bytes32) public orderToEscrow;
    
    // ============ EVENTS ============
    
    event FusionOrderCreated(
        bytes32 indexed orderHash,
        bytes32 indexed escrowId,
        address indexed maker,
        address taker,
        address resolver,
        uint256 amount
    );
    
    // ============ ERRORS ============
    
    error OnlyLimitOrderProtocol();
    error InvalidFusionData();
    error EscrowCreationFailed();
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _limitOrderProtocol,
        address _escrowFactory
    ) Ownable(msg.sender) {
        LIMIT_ORDER_PROTOCOL = _limitOrderProtocol;
        ESCROW_FACTORY = EscrowFactory(_escrowFactory);
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyLimitOrderProtocol() {
        if (msg.sender != LIMIT_ORDER_PROTOCOL) {
            revert OnlyLimitOrderProtocol();
        }
        _;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @notice PostInteraction hook called by LOP after order filling
     * @dev Creates escrow for cross-chain atomic swap using the filled order data
     * @param order The LOP order that was filled
     * @param extension Extension data (unused in this implementation) 
     * @param orderHash Hash of the filled order
     * @param taker Address that filled the order
     * @param makingAmount Actual amount of maker asset transferred
     * @param takingAmount Actual amount of taker asset transferred  
     * @param remainingMakingAmount Remaining unfilled maker amount
     * @param extraData Encoded FusionOrderData struct
     */
    function postInteraction(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external override onlyLimitOrderProtocol nonReentrant {
        // Decode fusion order data from extraData
        FusionOrderData memory fusionData;
        try this.decodeFusionData(extraData) returns (FusionOrderData memory decoded) {
            fusionData = decoded;
        } catch {
            revert InvalidFusionData();
        }
        
        // Validate the fusion data matches the order
        require(fusionData.srcToken == order.makerAsset.get(), "Token mismatch");
        
        // Create escrow using the existing EscrowFactory
        bytes32 escrowId;
        try ESCROW_FACTORY.createEscrowFromExtension{value: fusionData.safetyDeposit}(
            order.maker.get(),
            fusionData.resolver,
            fusionData.srcToken,
            makingAmount,
            fusionData.secretHash,
            fusionData.timelock
        ) returns (bytes32 id) {
            escrowId = id;
        } catch {
            revert EscrowCreationFailed();
        }
        
        // Store the escrow mapping
        orderToEscrow[orderHash] = escrowId;
        
        emit FusionOrderCreated(
            orderHash,
            escrowId, 
            order.maker.get(),
            taker,
            fusionData.resolver,
            makingAmount
        );
    }
    
    /**
     * @notice Decode fusion order data from extraData
     * @dev External function to allow try/catch error handling
     * @param extraData Encoded FusionOrderData
     * @return Decoded FusionOrderData struct
     */
    function decodeFusionData(bytes calldata extraData) external pure returns (FusionOrderData memory) {
        return abi.decode(extraData, (FusionOrderData));
    }
    
    /**
     * @notice Get escrow ID for a given order hash
     * @param orderHash Hash of the LOP order
     * @return Corresponding escrow ID, zero if not found
     */
    function getEscrowForOrder(bytes32 orderHash) external view returns (bytes32) {
        return orderToEscrow[orderHash];
    }
    
    // ============ RECOVERY FUNCTIONS ============
    
    /**
     * @notice Emergency withdrawal of stuck ETH (owner only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    /**
     * @notice Emergency withdrawal of stuck tokens (owner only)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    // ============ RECEIVE ============
    
    receive() external payable {
        // Allow receiving ETH for safety deposits
    }
} 