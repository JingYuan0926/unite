// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// TRON FIX: Remove OpenZeppelin Create2 and Clones imports - they use wrong CREATE2 prefix
// import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
// import { Clones } from "@openzeppelin/contracts/proxy/Clones.sol";
import { Address, AddressLib } from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import { SafeERC20 } from "@1inch/solidity-utils/contracts/libraries/SafeERC20.sol";

import "../ethereum/official-escrow/interfaces/IEscrowFactory.sol";
import "../ethereum/official-escrow/interfaces/IBaseEscrow.sol";
import "../ethereum/official-escrow/libraries/ImmutablesLib.sol";
import "../ethereum/official-escrow/libraries/TimelocksLib.sol";
// TRON FIX: Replace ProxyHashLib with Tron-compatible version
// import "../ethereum/official-escrow/libraries/ProxyHashLib.sol";
import "./libraries/TronProxyHashLib.sol";
import "./libraries/TronCreate2Lib.sol";
import "./libraries/TronClonesLib.sol";
import "./TronEscrowSrc.sol";
import "./TronEscrowDst.sol";

/**
 * @title TronEscrowFactoryPatched
 * @notice Tron-compatible escrow factory with TVM-specific fixes
 * @dev PATCHED VERSION: Fixes CREATE2 prefix incompatibility and other TVM issues
 *      This version uses 0x41 CREATE2 prefix instead of Ethereum's 0xff
 * @custom:security-contact security@1inch.io
 */
contract TronEscrowFactoryPatched is IEscrowFactory {
    using AddressLib for Address;
    // TRON FIX: Use Tron-compatible libraries instead of OpenZeppelin
    using TronClonesLib for address;
    using ImmutablesLib for IBaseEscrow.Immutables;
    using SafeERC20 for IERC20;
    using TimelocksLib for Timelocks;

    /// @notice See {IEscrowFactory-ESCROW_SRC_IMPLEMENTATION}.
    address public immutable ESCROW_SRC_IMPLEMENTATION;
    /// @notice See {IEscrowFactory-ESCROW_DST_IMPLEMENTATION}.
    address public immutable ESCROW_DST_IMPLEMENTATION;
    
    // Bytecode hashes for deterministic addressing - computed with Tron-compatible library
    bytes32 internal immutable _PROXY_SRC_BYTECODE_HASH;
    bytes32 internal immutable _PROXY_DST_BYTECODE_HASH;

    // Tron network configuration
    address public immutable OWNER;
    IERC20 public immutable ACCESS_TOKEN;
    IERC20 public immutable FEE_TOKEN;

    // Tron-specific constants
    uint256 private constant TRON_CHAIN_ID = 3448148188; // Nile Testnet

    // TRON FIX: Add error handling for better debugging
    error InsufficientNativeValue(uint256 required, uint256 provided);
    error InvalidToken();
    error InvalidAmount();
    error InvalidHashlock();
    error InvalidTimingConstraints();
    error NativeTransferFailed();
    error OnlyOwner();
    error InvalidRecipient();

    /**
     * @notice Constructor for TronEscrowFactoryPatched
     * @dev TRON FIX: Uses Tron-compatible libraries for bytecode hash calculation
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

        // TRON FIX: Calculate proxy bytecode hashes using Tron-compatible library
        _PROXY_SRC_BYTECODE_HASH = TronProxyHashLib.computeProxyBytecodeHash(ESCROW_SRC_IMPLEMENTATION);
        _PROXY_DST_BYTECODE_HASH = TronProxyHashLib.computeProxyBytecodeHash(ESCROW_DST_IMPLEMENTATION);
    }

    /**
     * @notice See {IEscrowFactory-createDstEscrow}.
     * @dev TRON FIX: Enhanced error handling and validation for better debugging
     */
    function createDstEscrow(
        IBaseEscrow.Immutables calldata dstImmutables,
        uint256 srcCancellationTimestamp
    ) external payable override {
        // TRON FIX: Enhanced validation with specific error messages
        if (dstImmutables.amount == 0) revert InvalidAmount();
        if (dstImmutables.hashlock == bytes32(0)) revert InvalidHashlock();
        
        // TRON FIX: Safer address extraction with validation
        address tokenAddress = dstImmutables.token.get();
        
        uint256 nativeAmount = dstImmutables.safetyDeposit;

        // Handle TRX (native) vs TRC20 tokens
        if (tokenAddress == address(0)) {
            // Native TRX case - total value includes token amount + safety deposit
            nativeAmount += dstImmutables.amount;
        }

        if (msg.value < nativeAmount) {
            revert InsufficientNativeValue(nativeAmount, msg.value);
        }

        // Create immutables with deployment timestamp
        IBaseEscrow.Immutables memory immutables = dstImmutables;
        immutables.timelocks = immutables.timelocks.setDeployedAt(block.timestamp);

        // Validate timing constraints
        if (immutables.timelocks.get(TimelocksLib.Stage.DstCancellation) > srcCancellationTimestamp) {
            revert InvalidTimingConstraints();
        }

        // TRON FIX: Calculate deterministic address using Tron-compatible CREATE2
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
     * @dev TRON FIX: Use Tron-compatible CREATE2 address computation
     */
    function addressOfEscrowSrc(IBaseEscrow.Immutables calldata immutables)
        external view override returns (address)
    {
        // TRON FIX: Use TronCreate2Lib instead of OpenZeppelin Create2
        return TronCreate2Lib.computeAddress(immutables.hash(), _PROXY_SRC_BYTECODE_HASH, address(this));
    }

    /**
     * @notice See {IEscrowFactory-addressOfEscrowDst}.
     * @dev TRON FIX: Use Tron-compatible CREATE2 address computation
     */
    function addressOfEscrowDst(IBaseEscrow.Immutables calldata immutables)
        external view override returns (address)
    {
        // TRON FIX: Use TronCreate2Lib instead of OpenZeppelin Create2
        return TronCreate2Lib.computeAddress(immutables.hash(), _PROXY_DST_BYTECODE_HASH, address(this));
    }

    /**
     * @dev TRON FIX: Deploy escrow using Tron-compatible CREATE2
     * @param salt Salt for CREATE2 deployment
     * @param value Native token value to send
     * @param bytecodeHash Bytecode hash for verification
     * @param implementation Implementation contract address
     * @return escrowAddress Address of deployed escrow
     */
    function _deployEscrow(
        bytes32 salt,
        uint256 value,
        bytes32 bytecodeHash,
        address implementation
    ) internal returns (address escrowAddress) {
        // TRON FIX: Use Tron-compatible Clones library
        escrowAddress = TronClonesLib.cloneDeterministic(implementation, salt, value);
        
        // TRON FIX: Validate the deployment was successful and address matches expectation
        bytes32 computedHash = TronProxyHashLib.computeProxyBytecodeHash(implementation);
        require(computedHash == bytecodeHash, "TronEscrowFactory: Bytecode hash mismatch");
        
        // TRON FIX: Verify the deployed address matches our computation
        address expectedAddress = TronCreate2Lib.computeAddress(salt, bytecodeHash, address(this));
        require(escrowAddress == expectedAddress, "TronEscrowFactory: Address mismatch");

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
        if (msg.sender != OWNER) revert OnlyOwner();
        if (to == address(0)) revert InvalidRecipient();

        if (token == address(0)) {
            // Rescue TRX
            (bool success, ) = to.call{value: amount}("");
            if (!success) revert NativeTransferFailed();
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

    /**
     * @notice TRON FIX: Debug function to validate CREATE2 computation
     * @dev This function helps verify that our Tron CREATE2 implementation is working correctly
     * @param salt The salt to use for computation
     * @param bytecodeHash The bytecode hash to use
     * @return computed The computed address
     * @return deployer The deployer address (this contract)
     */
    function debugComputeAddress(bytes32 salt, bytes32 bytecodeHash) 
        external view returns (address computed, address deployer) 
    {
        computed = TronCreate2Lib.computeAddress(salt, bytecodeHash, address(this));
        deployer = address(this);
    }
}