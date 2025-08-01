// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { Address, AddressLib } from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import { SafeERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";

import "../ethereum/official-escrow/interfaces/IEscrowFactory.sol";
import "../ethereum/official-escrow/interfaces/IBaseEscrow.sol";
import "../ethereum/official-escrow/libraries/ImmutablesLib.sol";
import "../ethereum/official-escrow/libraries/TimelocksLib.sol";
import "../ethereum/official-escrow/libraries/ProxyHashLib.sol";
import "./TronEscrowSrc.sol";
import "./TronEscrowDst.sol";

/**
 * @title TronEscrowFactory
 * @notice Tron-compatible escrow factory implementing official IEscrowFactory interface
 * @dev Maintains exact same interface as official EscrowFactory but adapted for Tron network
 *      Supports deterministic addressing compatible with Ethereum contracts
 * @custom:security-contact security@1inch.io
 */
contract TronEscrowFactory is IEscrowFactory {
    using AddressLib for Address;
    using Clones for address;
    using ImmutablesLib for IBaseEscrow.Immutables;
    using SafeERC20 for IERC20;
    using TimelocksLib for Timelocks;

    /// @notice See {IEscrowFactory-ESCROW_SRC_IMPLEMENTATION}.
    address public immutable ESCROW_SRC_IMPLEMENTATION;
    /// @notice See {IEscrowFactory-ESCROW_DST_IMPLEMENTATION}.
    address public immutable ESCROW_DST_IMPLEMENTATION;
    
    // Bytecode hashes for deterministic addressing
    bytes32 internal immutable _PROXY_SRC_BYTECODE_HASH;
    bytes32 internal immutable _PROXY_DST_BYTECODE_HASH;

    // Tron network configuration
    address public immutable OWNER;
    IERC20 public immutable ACCESS_TOKEN;
    IERC20 public immutable FEE_TOKEN;

    // Tron-specific constants
    uint256 private constant TRON_CHAIN_ID = 3448148188; // Nile Testnet

    /**
     * @notice Constructor for TronEscrowFactory
     * @dev Creates implementation contracts and calculates bytecode hashes
     * @param feeToken Token used for fees (can be zero address)
     * @param accessToken Token required for access control (can be zero address)
     * @param owner Factory owner address
     * @param rescueDelaySrc Rescue delay for source escrow contracts
     * @param rescueDelayDst Rescue delay for destination escrow contracts
     */
    constructor(
        address /* limitOrderProtocol */, // Will be zero address for Tron
        IERC20 feeToken,
        IERC20 accessToken,
        address owner,
        uint32 rescueDelaySrc,
        uint32 rescueDelayDst
    ) {
        // Store configuration
        OWNER = owner;
        ACCESS_TOKEN = accessToken;
        FEE_TOKEN = feeToken;

        // Deploy Tron-specific implementation contracts
        ESCROW_SRC_IMPLEMENTATION = address(new TronEscrowSrc(rescueDelaySrc, accessToken));
        ESCROW_DST_IMPLEMENTATION = address(new TronEscrowDst(rescueDelayDst, accessToken));

        // Calculate proxy bytecode hashes for deterministic addressing
        _PROXY_SRC_BYTECODE_HASH = ProxyHashLib.computeProxyBytecodeHash(ESCROW_SRC_IMPLEMENTATION);
        _PROXY_DST_BYTECODE_HASH = ProxyHashLib.computeProxyBytecodeHash(ESCROW_DST_IMPLEMENTATION);
    }

    /**
     * @notice See {IEscrowFactory-createDstEscrow}.
     * @dev Creates destination escrow on Tron network with exact same interface as Ethereum
     */
    function createDstEscrow(
        IBaseEscrow.Immutables calldata dstImmutables,
        uint256 srcCancellationTimestamp
    ) external payable override {
        // Validate inputs
        require(dstImmutables.amount > 0, "TronEscrowFactory: Invalid amount");
        require(dstImmutables.hashlock != bytes32(0), "TronEscrowFactory: Invalid hashlock");
        
        address tokenAddress = dstImmutables.token.get();
        uint256 nativeAmount = dstImmutables.safetyDeposit;

        // Handle TRX (native) vs TRC20 tokens
        if (tokenAddress == address(0)) {
            // Native TRX case - total value includes token amount + safety deposit
            nativeAmount += dstImmutables.amount;
        }

        require(msg.value >= nativeAmount, "TronEscrowFactory: Insufficient native value");

        // Create immutables with deployment timestamp
        IBaseEscrow.Immutables memory immutables = dstImmutables;
        immutables.timelocks = immutables.timelocks.setDeployedAt(block.timestamp);

        // Validate timing constraints
        require(
            immutables.timelocks.get(TimelocksLib.Stage.DstCancellation) <= srcCancellationTimestamp,
            "TronEscrowFactory: Invalid timing constraints"
        );

        // Calculate deterministic address
        bytes32 salt = immutables.hashMem();
        address escrowAddress = _deployEscrow(salt, msg.value, _PROXY_DST_BYTECODE_HASH, ESCROW_DST_IMPLEMENTATION);

        // Transfer TRC20 tokens if not native TRX
        if (tokenAddress != address(0)) {
            IERC20(tokenAddress).safeTransferFrom(msg.sender, escrowAddress, immutables.amount);
        }

        // Emit event for off-chain tracking
        emit DstEscrowCreated(escrowAddress, dstImmutables.hashlock, dstImmutables.taker);
    }

    /**
     * @notice See {IEscrowFactory-addressOfEscrowSrc}.
     * @dev Calculate deterministic address for source escrow (cross-chain compatible)
     */
    function addressOfEscrowSrc(IBaseEscrow.Immutables calldata immutables)
        external view override returns (address)
    {
        return Create2.computeAddress(immutables.hash(), _PROXY_SRC_BYTECODE_HASH);
    }

    /**
     * @notice See {IEscrowFactory-addressOfEscrowDst}.
     * @dev Calculate deterministic address for destination escrow (cross-chain compatible)
     */
    function addressOfEscrowDst(IBaseEscrow.Immutables calldata immutables)
        external view override returns (address)
    {
        return Create2.computeAddress(immutables.hash(), _PROXY_DST_BYTECODE_HASH);
    }

    /**
     * @dev Deploy escrow using CREATE2 for deterministic addressing
     * @param salt Salt for CREATE2 deployment
     * @param value Native token value to send
     * @param implementation Implementation contract address
     * @return escrowAddress Address of deployed escrow
     */
    function _deployEscrow(
        bytes32 salt,
        uint256 value,
        bytes32 /* bytecodeHash */,
        address implementation
    ) internal returns (address escrowAddress) {
        // Use OpenZeppelin's Clones library for proxy deployment
        escrowAddress = Clones.cloneDeterministic(implementation, salt);
        
        // Send native tokens to the escrow
        if (value > 0) {
            (bool success, ) = escrowAddress.call{value: value}("");
            require(success, "TronEscrowFactory: Native transfer failed");
        }

        return escrowAddress;
    }

    /**
     * @notice Get Tron chain ID for validation
     * @return Tron network chain ID
     */
    function getTronChainId() external pure returns (uint256) {
        return TRON_CHAIN_ID;
    }

    /**
     * @notice Check if this factory is configured for Tron network
     * @return True if configured for Tron
     */
    function isTronFactory() external pure returns (bool) {
        return true;
    }

    /**
     * @notice Get factory configuration
     * @return owner Factory owner address
     * @return accessToken Access control token
     * @return feeToken Fee token address
     */
    function getFactoryConfig() external view returns (address owner, IERC20 accessToken, IERC20 feeToken) {
        return (OWNER, ACCESS_TOKEN, FEE_TOKEN);
    }

    /**
     * @notice Emergency function to rescue accidentally sent tokens
     * @dev Only owner can call this function
     * @param token Token address (zero for TRX)
     * @param amount Amount to rescue
     * @param to Recipient address
     */
    function emergencyRescue(address token, uint256 amount, address to) external {
        require(msg.sender == OWNER, "TronEscrowFactory: Only owner");
        require(to != address(0), "TronEscrowFactory: Invalid recipient");

        if (token == address(0)) {
            // Rescue TRX
            (bool success, ) = to.call{value: amount}("");
            require(success, "TronEscrowFactory: TRX rescue failed");
        } else {
            // Rescue TRC20
            IERC20(token).safeTransfer(to, amount);
        }
    }   

    /**
     * @dev Allow factory to receive TRX for escrow deployments
     */
    receive() external payable {
        // Allow receiving TRX for escrow operations
    }
}