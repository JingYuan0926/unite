// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title TronProxyHashLib
 * @notice Tron-compatible proxy bytecode hash computation library
 * @dev Adapts the original ProxyHashLib for Tron's TVM compatibility
 * @custom:security-contact security@1inch.io
 */
library TronProxyHashLib {
    /**
     * @notice Returns the hash of the proxy bytecode concatenated with the implementation address.
     * @dev TRON FIX: Ensures TVM-compatible bytecode hash computation
     * @param implementation The address of the contract to clone.
     * @return bytecodeHash The hash of the resulting bytecode.
     */
    function computeProxyBytecodeHash(address implementation) internal pure returns (bytes32 bytecodeHash) {
        // TRON FIX: Use a more compatible approach for TVM
        // Instead of complex assembly manipulation, use straightforward bytecode construction
        bytes memory proxyBytecode = abi.encodePacked(
            // EIP-1167 minimal proxy bytecode prefix
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            // Implementation address (20 bytes)
            implementation,
            // EIP-1167 minimal proxy bytecode suffix
            hex"5af43d82803e903d91602b57fd5bf3"
        );
        
        bytecodeHash = keccak256(proxyBytecode);
    }

    /**
     * @notice Validates that the provided bytecode hash matches the computed hash
     * @dev TRON FIX: Additional validation for Tron deployment verification
     * @param implementation The implementation address
     * @param providedHash The hash to validate
     * @return True if hashes match, false otherwise
     */
    function validateProxyBytecodeHash(address implementation, bytes32 providedHash) internal pure returns (bool) {
        return computeProxyBytecodeHash(implementation) == providedHash;
    }

    /**
     * @notice Computes the proxy bytecode for manual verification
     * @dev TRON FIX: Provides access to the actual bytecode for debugging
     * @param implementation The implementation address
     * @return The complete proxy bytecode
     */
    function getProxyBytecode(address implementation) internal pure returns (bytes memory) {
        return abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );
    }
}