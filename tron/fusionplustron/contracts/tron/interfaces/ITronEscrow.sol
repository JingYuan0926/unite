// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../../ethereum/official-escrow/interfaces/IBaseEscrow.sol";

/**
 * @title ITronEscrow
 * @notice Tron-compatible interface extending official IBaseEscrow
 * @dev Maintains exact same interface as official contracts but adds Tron-specific utilities
 * @custom:security-contact security@1inch.io
 */
interface ITronEscrow is IBaseEscrow {
    /**
     * @notice Get Tron address representation
     * @dev Tron-specific helper function for address format conversion
     * @return Tron base58 address string representation
     */
    function getTronAddress() external view returns (string memory);

    /**
     * @notice Verify Tron network compatibility
     * @dev Ensures the contract is operating on Tron network
     * @return True if running on Tron network
     */
    function isTronNetwork() external view returns (bool);
}