// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../libraries/TronClonesLib.sol";

/**
 * @title TronClonesTest
 * @notice Minimal test contract to isolate Clones functionality on Tron
 * @dev This contract tests only the proxy deployment using Tron-compatible CREATE2
 */
contract TronClonesTest {
    using TronClonesLib for address;

    event CloneDeployed(address clone, address implementation, bytes32 salt);
    event AddressPredicted(address predicted, address actual, bool matches);
    
    // Simple implementation contract for testing
    address public immutable IMPLEMENTATION;

    constructor() {
        IMPLEMENTATION = address(new SimpleImplementation());
    }

    /**
     * @notice Test deterministic clone deployment
     * @param salt Salt for deployment
     * @return clone The deployed clone address
     */
    function testCloneDeterministic(bytes32 salt) 
        external returns (address clone) 
    {
        clone = TronClonesLib.cloneDeterministic(IMPLEMENTATION, salt);
        emit CloneDeployed(clone, IMPLEMENTATION, salt);
        return clone;
    }

    /**
     * @notice Test address prediction vs actual deployment
     * @param salt Salt for deployment
     * @return predicted The predicted address
     * @return actual The actual deployed address
     * @return matches Whether they match
     */
    function testAddressPrediction(bytes32 salt) 
        external returns (address predicted, address actual, bool matches) 
    {
        predicted = TronClonesLib.predictDeterministicAddress(IMPLEMENTATION, salt, address(this));
        actual = TronClonesLib.cloneDeterministic(IMPLEMENTATION, salt);
        matches = (predicted == actual);
        
        emit AddressPredicted(predicted, actual, matches);
        return (predicted, actual, matches);
    }

    /**
     * @notice Test clone with TRX value
     * @param salt Salt for deployment
     * @return clone The deployed clone address
     */
    function testCloneWithValue(bytes32 salt) 
        external payable returns (address clone) 
    {
        clone = TronClonesLib.cloneDeterministic(IMPLEMENTATION, salt, msg.value);
        emit CloneDeployed(clone, IMPLEMENTATION, salt);
        return clone;
    }

    /**
     * @notice Get implementation address
     * @return The implementation address
     */
    function getImplementation() external view returns (address) {
        return IMPLEMENTATION;
    }
}

/**
 * @title SimpleImplementation
 * @notice Simple implementation contract for testing clones
 */
contract SimpleImplementation {
    uint256 public value;
    
    function setValue(uint256 _value) external {
        value = _value;
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
    
    receive() external payable {}
}