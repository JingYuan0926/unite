// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IOrderMixin } from "../../../official-lop/interfaces/IOrderMixin.sol";
import { BaseExtension } from "./BaseExtension.sol";

/**
 * @title ResolverValidationExtension - Minimal stub for compilation
 * @dev This is a temporary implementation to allow compilation.
 * In production, use the official limit-order-settlement package.
 */
abstract contract ResolverValidationExtension is BaseExtension {
    /// @notice Fee token for resolver validation
    IERC20 public immutable FEE_TOKEN;
    
    /// @notice Access token for resolver validation
    IERC20 public immutable ACCESS_TOKEN;
    
    /// @notice Owner address
    address public immutable OWNER;

    /// @notice Error when resolver cannot fill order
    error ResolverCanNotFillOrder();

    constructor(IERC20 feeToken, IERC20 accessToken, address owner) {
        FEE_TOKEN = feeToken;
        ACCESS_TOKEN = accessToken;
        OWNER = owner;
    }

    /// @dev Override _postInteraction to add resolver validation logic
    function _postInteraction(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) internal virtual override {
        // Basic resolver validation - can be enhanced in production
        // For now, just call parent implementation
        super._postInteraction(order, extension, orderHash, taker, makingAmount, takingAmount, remainingMakingAmount, extraData);
    }
}