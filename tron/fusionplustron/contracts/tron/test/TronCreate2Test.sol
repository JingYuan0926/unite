// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../libraries/TronCreate2Lib.sol";

/**
 * @title TronCreate2Test
 * @notice Minimal test contract to isolate CREATE2 functionality on Tron
 * @dev This contract tests only the CREATE2 address computation with 0x41 prefix
 */
contract TronCreate2Test {
    event AddressComputed(address computed, bytes32 salt, bytes32 bytecodeHash);
    event DeploymentTest(address deployed, address expected, bool matches);

    /**
     * @notice Test CREATE2 address computation
     * @param salt Salt for CREATE2
     * @param bytecodeHash Bytecode hash
     * @return computed The computed address
     */
    function testComputeAddress(bytes32 salt, bytes32 bytecodeHash) 
        external returns (address computed) 
    {
        computed = TronCreate2Lib.computeAddress(salt, bytecodeHash, address(this));
        emit AddressComputed(computed, salt, bytecodeHash);
        return computed;
    }

    /**
     * @notice Test actual CREATE2 deployment vs computation
     * @param salt Salt for deployment
     * @return deployed The deployed address
     * @return expected The expected address
     * @return matches Whether they match
     */
    function testDeployment(bytes32 salt) 
        external returns (address deployed, address expected, bool matches) 
    {
        // Simple contract bytecode that just returns its address
        bytes memory bytecode = hex"608060405234801561001057600080fd5b50600a80601d6000396000f3fe6080604052600080fdfea264697066735822122012345678901234567890123456789012345678901234567890123456789012345678";
        bytes32 bytecodeHash = keccak256(bytecode);
        
        expected = TronCreate2Lib.computeAddress(salt, bytecodeHash, address(this));
        deployed = TronCreate2Lib.deploy(0, salt, bytecode);
        matches = (deployed == expected);
        
        emit DeploymentTest(deployed, expected, matches);
        return (deployed, expected, matches);
    }

    /**
     * @notice Compare Tron vs Ethereum CREATE2 computation
     * @param salt Salt to use
     * @param bytecodeHash Bytecode hash to use
     * @return tronAddress Address computed with Tron method (0x41)
     * @return ethereumAddress Address computed with Ethereum method (0xff)
     */
    function compareCreate2Methods(bytes32 salt, bytes32 bytecodeHash) 
        external view returns (address tronAddress, address ethereumAddress) 
    {
        // Tron computation (0x41 prefix)
        tronAddress = TronCreate2Lib.computeAddress(salt, bytecodeHash, address(this));
        
        // Ethereum computation (0xff prefix) for comparison
        ethereumAddress = address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            bytecodeHash
        )))));
        
        return (tronAddress, ethereumAddress);
    }
}