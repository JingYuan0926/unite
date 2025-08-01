// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./TronCreate2Lib.sol";

/**
 * @title TronClonesLib
 * @notice Tron-compatible minimal proxy deployment library
 * @dev Adapts OpenZeppelin's Clones library for Tron's TVM using correct CREATE2 prefix
 * @custom:security-contact security@1inch.io
 */
library TronClonesLib {
    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `implementation`.
     * This function uses the create2 opcode and a `salt` to deterministically deploy
     * the clone. Using the same `implementation` and `salt` multiple times will revert, since
     * the clones cannot be deployed twice at the same address.
     * 
     * TRON FIX: Uses TronCreate2Lib for proper CREATE2 address computation on Tron
     * 
     * @param implementation The address of the contract to clone
     * @param salt The salt for deterministic deployment
     * @param value The amount of TRX to send to the new clone
     * @return instance The address of the deployed clone
     */
    function cloneDeterministic(address implementation, bytes32 salt, uint256 value) internal returns (address instance) {
        bytes memory bytecode = _getCloneBytecode(implementation);
        instance = TronCreate2Lib.deploy(value, salt, bytecode);
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `implementation`.
     * This function uses the create2 opcode and a `salt` to deterministically deploy
     * the clone without sending any TRX.
     * 
     * @param implementation The address of the contract to clone
     * @param salt The salt for deterministic deployment
     * @return instance The address of the deployed clone
     */
    function cloneDeterministic(address implementation, bytes32 salt) internal returns (address instance) {
        return cloneDeterministic(implementation, salt, 0);
    }

    /**
     * @dev Computes the address of a clone deployed using CREATE2 and the given salt.
     * 
     * TRON FIX: Uses TronCreate2Lib for proper address computation on Tron
     * 
     * @param implementation The address of the contract to clone
     * @param salt The salt for deterministic deployment
     * @param deployer The address that will deploy the clone
     * @return predicted The predicted address of the clone
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt,
        address deployer
    ) internal pure returns (address predicted) {
        bytes32 bytecodeHash = _getBytecodeHash(implementation);
        return TronCreate2Lib.computeAddress(salt, bytecodeHash, deployer);
    }

    /**
     * @dev Computes the address of a clone deployed using CREATE2 and the given salt.
     * Uses msg.sender as the deployer.
     * 
     * @param implementation The address of the contract to clone
     * @param salt The salt for deterministic deployment
     * @return predicted The predicted address of the clone
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt
    ) internal view returns (address predicted) {
        return predictDeterministicAddress(implementation, salt, address(this));
    }

    /**
     * @dev Generates the minimal proxy bytecode for the given implementation.
     * Based on EIP-1167 minimal proxy standard.
     * 
     * @param implementation The address of the implementation contract
     * @return bytecode The minimal proxy bytecode
     */
    function _getCloneBytecode(address implementation) private pure returns (bytes memory bytecode) {
        // EIP-1167 minimal proxy bytecode with implementation address embedded
        bytecode = abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );
    }

    /**
     * @dev Computes the hash of the clone bytecode for the given implementation.
     * 
     * TRON FIX: This ensures bytecode hash computation is compatible with TVM
     * 
     * @param implementation The address of the implementation contract
     * @return Hash of the clone bytecode
     */
    function _getBytecodeHash(address implementation) private pure returns (bytes32) {
        bytes memory bytecode = _getCloneBytecode(implementation);
        return keccak256(bytecode);
    }

    /**
     * @dev Public function to get the bytecode hash for external use
     * This is used by the factory for deterministic address computation
     * 
     * @param implementation The address of the implementation contract
     * @return The bytecode hash
     */
    function computeProxyBytecodeHash(address implementation) internal pure returns (bytes32) {
        return _getBytecodeHash(implementation);
    }
}