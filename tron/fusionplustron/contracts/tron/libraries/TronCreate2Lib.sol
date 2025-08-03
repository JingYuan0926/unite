// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title TronCreate2Lib
 * @notice Tron-compatible CREATE2 address computation library
 * @dev Adapts OpenZeppelin's Create2 library for Tron's TVM which uses 0x41 prefix instead of 0xff
 * @custom:security-contact security@1inch.io
 */
library TronCreate2Lib {
    // TRON FIX: Use 0x41 prefix instead of Ethereum's 0xff for CREATE2 address computation
    // This is the critical difference between Ethereum's EVM and Tron's TVM
    bytes1 private constant _TRON_CREATE2_PREFIX = 0x41;

    /**
     * @dev Returns the address where a contract will be stored if deployed via CREATE2 on Tron.
     * See https://eips.ethereum.org/EIPS/eip-1014 for specification, adapted for Tron.
     * @param salt The salt used for the deployment
     * @param bytecodeHash The hash of the bytecode to deploy
     * @param deployer The address that will deploy the contract
     * @return The computed address where the contract will be deployed
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash, address deployer) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(_TRON_CREATE2_PREFIX, deployer, salt, bytecodeHash)))));
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via CREATE2 on Tron.
     * Uses msg.sender as the deployer address.
     * @param salt The salt used for the deployment
     * @param bytecodeHash The hash of the bytecode to deploy
     * @return The computed address where the contract will be deployed
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash) internal view returns (address) {
        return computeAddress(salt, bytecodeHash, address(this));
    }

    /**
     * @dev Deploys a contract using CREATE2 on Tron.
     * @param amount The amount of TRX to send to the new contract
     * @param salt The salt used for the deployment
     * @param bytecode The bytecode to deploy
     * @return addr The address of the deployed contract
     */
    function deploy(uint256 amount, bytes32 salt, bytes memory bytecode) internal returns (address addr) {
        // TRON FIX: Ensure we're using Tron-compatible CREATE2 deployment
        if (bytecode.length == 0) {
            revert("TronCreate2Lib: Empty bytecode");
        }
        
        assembly ("memory-safe") {
            addr := create2(amount, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        if (addr == address(0)) {
            revert("TronCreate2Lib: Create2 deployment failed");
        }
    }

    /**
     * @dev Validates that a computed address matches the actual deployment address
     * @param salt The salt used for deployment
     * @param bytecodeHash The hash of the deployed bytecode
     * @param deployer The deployer address
     * @param actualAddress The actual deployed contract address
     * @return True if addresses match, false otherwise
     */
    function validateAddress(
        bytes32 salt,
        bytes32 bytecodeHash,
        address deployer,
        address actualAddress
    ) internal pure returns (bool) {
        return computeAddress(salt, bytecodeHash, deployer) == actualAddress;
    }
}