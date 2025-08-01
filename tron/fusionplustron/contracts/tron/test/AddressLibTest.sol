// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Address, AddressLib } from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";

/**
 * @title AddressLibTest
 * @notice Minimal test contract to isolate AddressLib functionality on Tron
 * @dev This contract tests only the Address.get() conversion that's used in the factory
 */
contract AddressLibTest {
    using AddressLib for Address;

    event AddressConversion(uint256 input, address output, bool success);
    event AddressValidation(address input, uint256 output, address reconverted);

    /**
     * @notice Test Address.get() conversion
     * @param addressAsUint Address encoded as uint256
     * @return converted The converted address
     * @return success Whether conversion succeeded
     */
    function testAddressGet(uint256 addressAsUint) 
        external returns (address converted, bool success) 
    {
        try Address.wrap(addressAsUint).get() returns (address addr) {
            converted = addr;
            success = true;
        } catch {
            converted = address(0);
            success = false;
        }
        
        emit AddressConversion(addressAsUint, converted, success);
        return (converted, success);
    }

    /**
     * @notice Test round-trip conversion: address -> uint256 -> address
     * @param inputAddress Address to test
     * @return output The uint256 representation
     * @return reconverted The reconverted address
     * @return matches Whether round-trip succeeded
     */
    function testRoundTripConversion(address inputAddress) 
        external returns (uint256 output, address reconverted, bool matches) 
    {
        // Convert address to uint256
        output = uint256(uint160(inputAddress));
        
        // Convert back using AddressLib
        reconverted = Address.wrap(output).get();
        matches = (inputAddress == reconverted);
        
        emit AddressValidation(inputAddress, output, reconverted);
        return (output, reconverted, matches);
    }

    /**
     * @notice Test multiple address conversions used in factory
     * @param token Token address as uint256
     * @param maker Maker address as uint256  
     * @param taker Taker address as uint256
     * @return tokenAddr Converted token address
     * @return makerAddr Converted maker address
     * @return takerAddr Converted taker address
     * @return allSuccess Whether all conversions succeeded
     */
    function testMultipleConversions(
        uint256 token,
        uint256 maker,
        uint256 taker
    ) external returns (
        address tokenAddr,
        address makerAddr,
        address takerAddr,
        bool allSuccess
    ) {
        allSuccess = true;
        
        try Address.wrap(token).get() returns (address addr) {
            tokenAddr = addr;
        } catch {
            allSuccess = false;
        }
        
        try Address.wrap(maker).get() returns (address addr) {
            makerAddr = addr;
        } catch {
            allSuccess = false;
        }
        
        try Address.wrap(taker).get() returns (address addr) {
            takerAddr = addr;
        } catch {
            allSuccess = false;
        }
        
        return (tokenAddr, makerAddr, takerAddr, allSuccess);
    }

    /**
     * @notice Test zero address handling
     * @return zeroAsUint Zero address as uint256
     * @return convertedBack Converted back to address
     * @return isZero Whether result is zero address
     */
    function testZeroAddress() 
        external returns (uint256 zeroAsUint, address convertedBack, bool isZero) 
    {
        zeroAsUint = uint256(uint160(address(0)));
        convertedBack = Address.wrap(zeroAsUint).get();
        isZero = (convertedBack == address(0));
        
        return (zeroAsUint, convertedBack, isZero);
    }
}