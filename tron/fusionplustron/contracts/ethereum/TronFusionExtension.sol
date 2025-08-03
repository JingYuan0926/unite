// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";

import "./official-lop/interfaces/IPostInteraction.sol";
import "./official-lop/interfaces/IOrderMixin.sol";
import "./official-escrow/interfaces/IEscrowFactory.sol";
import "./official-escrow/interfaces/IBaseEscrow.sol";
import "./official-escrow/libraries/TimelocksLib.sol";
import { Timelocks } from "./official-escrow/libraries/TimelocksLib.sol";

/**
 * @title TronFusionExtension
 * @notice Official 1inch Fusion+ extension for Tron network integration
 * @dev Implements IPostInteraction to integrate with official LimitOrderProtocol
 * @dev This contract acts as a non-custodial notifier for cross-chain atomic swaps
 * @dev All fund handling is performed atomically by the official Resolver.sol before this hook
 */
contract TronFusionExtension is IPostInteraction, Ownable, ReentrancyGuard {
    using AddressLib for Address;
    using SafeERC20 for IERC20;
    using TimelocksLib for Timelocks;

    // ============ CONSTANTS ============
    
    /// @notice Special token address representing TRX in cross-chain orders
    address public constant TRX_REPRESENTATION = address(0x1);
    
    /// @notice Minimum timelock duration (1 hour)
    uint256 public constant MIN_TIMELOCK = 3600;
    
    /// @notice Maximum timelock duration (24 hours)
    uint256 public constant MAX_TIMELOCK = 86400;

    // ============ EVENTS ============

    event TronSwapInitiated(
        bytes32 indexed orderHash,
        address indexed maker,
        address indexed taker,
        uint256 ethAmount,
        uint256 trxAmount,
        bytes32 secretHash,
        string tronRecipient,
        address srcEscrowAddress
    );

    event EthEscrowCreated(
        bytes32 indexed orderHash,
        address indexed escrowAddress,
        bytes32 indexed secretHash,
        uint256 amount,
        uint256 safetyDeposit
    );

    event TronEscrowRequested(
        bytes32 indexed orderHash,
        string indexed tronFactory,
        bytes32 indexed secretHash,
        uint256 trxAmount
    );

    // ============ ERRORS ============

    error OnlyLimitOrderProtocol();
    error InvalidTronData();
    error InvalidTronAddress();
    error InvalidTimelock();
    error InvalidAmount();
    error InsufficientSafetyDeposit();
    error EscrowCreationFailed();

    // ============ STATE VARIABLES ============

    /// @notice Official LimitOrderProtocol address
    address public immutable LIMIT_ORDER_PROTOCOL;

    /// @notice Official EscrowFactory address
    IEscrowFactory public immutable ESCROW_FACTORY;

    /// @notice Mapping from order hash to Tron swap data
    mapping(bytes32 => TronSwapData) public orderSwapData;

    /// @notice Mapping from order hash to source escrow address
    mapping(bytes32 => address) public orderToSrcEscrow;

    // ============ STRUCTS ============

    /**
     * @notice Tron swap parameters encoded in extraData
     */
    struct TronSwapData {
        string tronRecipient;        // Tron address (base58 format)
        string tronFactory;          // Tron escrow factory address
        uint256 expectedTrxAmount;   // Expected TRX amount on Tron
        bytes32 secretHash;          // Atomic swap secret hash
        uint64 timelock;             // Timelock duration in seconds
        uint256 tronChainId;         // Tron chain ID (3448148188 for Nile)
        bool isActive;               // Whether the swap is active
    }

    // ============ CONSTRUCTOR ============

    constructor(
        address _limitOrderProtocol,
        address _escrowFactory
    ) Ownable(msg.sender) {
        if (_limitOrderProtocol == address(0) || _escrowFactory == address(0)) {
            revert InvalidTronData();
        }
        
        LIMIT_ORDER_PROTOCOL = _limitOrderProtocol;
        ESCROW_FACTORY = IEscrowFactory(_escrowFactory);
    }

    // ============ MODIFIERS ============

    modifier onlyLimitOrderProtocol() {
        if (msg.sender != LIMIT_ORDER_PROTOCOL) {
            revert OnlyLimitOrderProtocol();
        }
        _;
    }

    // ============ MAIN FUNCTIONS ============

    /**
     * @notice PostInteraction hook called by official LOP after order fill
     * @dev Creates escrow for cross-chain atomic swap with Tron
     * @param order Official LOP order structure
     * @param orderHash Official order hash
     * @param taker Address that filled the order
     * @param makingAmount Actual ETH/ERC20 amount transferred from maker
     * @param extraData Encoded TronSwapData
     */
    function postInteraction(
        IOrderMixin.Order calldata order,
        bytes calldata /* extension */,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 /* takingAmount */,
        uint256 /* remainingMakingAmount */,
        bytes calldata extraData
    ) external override onlyLimitOrderProtocol nonReentrant {
        
        // Decode Tron swap data
        TronSwapData memory tronData = abi.decode(extraData, (TronSwapData));
        
        // Validate Tron swap data
        _validateTronSwapData(tronData, makingAmount);
        
        // Validate taking asset is TRX representation for cross-chain orders
        if (order.takerAsset.get() != TRX_REPRESENTATION) {
            revert InvalidTronData();
        }

        // Store Tron swap data for this order
        orderSwapData[orderHash] = tronData;
        orderSwapData[orderHash].isActive = true;

        // Create immutables for source escrow creation
        IBaseEscrow.Immutables memory immutables = IBaseEscrow.Immutables({
            orderHash: orderHash,
            hashlock: tronData.secretHash,
            maker: order.maker,
            taker: Address.wrap(uint160(taker)),
            token: order.makerAsset, // ETH or ERC20 being swapped
            amount: makingAmount,
            safetyDeposit: 0, // Safety deposit handled separately
            timelocks: _createTimelocks(tronData.timelock)
        });

        // Pre-compute source escrow address
        address srcEscrowAddress = ESCROW_FACTORY.addressOfEscrowSrc(immutables);
        
        // Store escrow address mapping
        orderToSrcEscrow[orderHash] = srcEscrowAddress;

        // Emit events for off-chain coordination
        emit TronSwapInitiated(
            orderHash,
            order.maker.get(),
            taker,
            makingAmount,
            tronData.expectedTrxAmount,
            tronData.secretHash,
            tronData.tronRecipient,
            srcEscrowAddress
        );

        emit EthEscrowCreated(
            orderHash,
            srcEscrowAddress,
            tronData.secretHash,
            makingAmount,
            0
        );

        emit TronEscrowRequested(
            orderHash,
            tronData.tronFactory,
            tronData.secretHash,
            tronData.expectedTrxAmount
        );
    }

    // ============ VALIDATION FUNCTIONS ============

    /**
     * @dev Validate Tron swap data
     */
    function _validateTronSwapData(TronSwapData memory tronData, uint256 makingAmount) internal pure {
        // Validate Tron recipient address format (basic check)
        if (bytes(tronData.tronRecipient).length == 0 || 
            bytes(tronData.tronRecipient).length > 34) {
            revert InvalidTronAddress();
        }

        // Validate Tron factory address
        if (bytes(tronData.tronFactory).length == 0) {
            revert InvalidTronData();
        }

        // Validate timelock
        if (tronData.timelock < MIN_TIMELOCK || tronData.timelock > MAX_TIMELOCK) {
            revert InvalidTimelock();
        }

        // Validate amounts
        if (tronData.expectedTrxAmount == 0 || makingAmount == 0) {
            revert InvalidAmount();
        }

        // Validate secret hash
        if (tronData.secretHash == bytes32(0)) {
            revert InvalidTronData();
        }

        // Validate Tron chain ID (3448148188 for Nile testnet)
        if (tronData.tronChainId != 3448148188) {
            revert InvalidTronData();
        }
    }

    /**
     * @dev Create timelocks structure for escrow using safe official method
     * @dev Uses the same pattern as official TimelocksSettersLib.init() for security
     */
    function _createTimelocks(uint64 timelock) internal pure returns (Timelocks) {
        // Safe timelock creation using official bit-shifting pattern
        // All delays are in seconds relative to deployment timestamp (set later by setDeployedAt)
        return Timelocks.wrap(
            (uint256(600) << (uint256(TimelocksLib.Stage.SrcWithdrawal) * 32))                        // srcWithdrawal: 10 minutes
                | (uint256(1800) << (uint256(TimelocksLib.Stage.SrcPublicWithdrawal) * 32))                  // srcPublicWithdrawal: 30 minutes  
                | (uint256(timelock) << (uint256(TimelocksLib.Stage.SrcCancellation) * 32))                  // srcCancellation: user-defined
                | (uint256(timelock + 3600) << (uint256(TimelocksLib.Stage.SrcPublicCancellation) * 32))    // srcPublicCancellation: +1 hour
                | (uint256(300) << (uint256(TimelocksLib.Stage.DstWithdrawal) * 32))                       // dstWithdrawal: 5 minutes
                | (uint256(900) << (uint256(TimelocksLib.Stage.DstPublicWithdrawal) * 32))                  // dstPublicWithdrawal: 15 minutes
                | (uint256(timelock - 300) << (uint256(TimelocksLib.Stage.DstCancellation) * 32))           // dstCancellation: 5 min earlier than src
        );
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get Tron swap data for an order
     */
    function getTronSwapData(bytes32 orderHash) external view returns (TronSwapData memory) {
        return orderSwapData[orderHash];
    }

    /**
     * @notice Get source escrow address for an order
     */
    function getSrcEscrowAddress(bytes32 orderHash) external view returns (address) {
        return orderToSrcEscrow[orderHash];
    }

    /**
     * @notice Check if order has active Tron swap
     */
    function hasActiveTronSwap(bytes32 orderHash) external view returns (bool) {
        return orderSwapData[orderHash].isActive;
    }

    /**
     * @notice Get Tron recipient for an order
     */
    function getTronRecipient(bytes32 orderHash) external view returns (string memory) {
        return orderSwapData[orderHash].tronRecipient;
    }

    /**
     * @notice Get expected TRX amount for an order
     */
    function getExpectedTrxAmount(bytes32 orderHash) external view returns (uint256) {
        return orderSwapData[orderHash].expectedTrxAmount;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Emergency function to deactivate a swap (owner only)
     */
    function deactivateSwap(bytes32 orderHash) external onlyOwner {
        orderSwapData[orderHash].isActive = false;
    }

    /**
     * @notice Emergency rescue function for accidentally sent ETH (owner only)
     * @dev This contract should not hold funds, but this function exists for emergencies
     */
    function rescueETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    /**
     * @notice Emergency rescue function for accidentally sent ERC20 tokens (owner only)
     * @dev This contract should not hold funds, but this function exists for emergencies
     */
    function rescueERC20(IERC20 token, uint256 amount) external onlyOwner {
        token.safeTransfer(owner(), amount);
    }
}