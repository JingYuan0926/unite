// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import { IPostInteraction } from "../../../official-lop/interfaces/IPostInteraction.sol";
import { IOrderMixin } from "../../../official-lop/interfaces/IOrderMixin.sol";

/**
 * @title BaseExtension - Minimal stub for compilation
 * @dev This is a temporary implementation to allow compilation.
 * In production, use the official limit-order-settlement package.
 */
abstract contract BaseExtension is IPostInteraction {
    /// @notice Limit Order Protocol address
    address public immutable LIMIT_ORDER_PROTOCOL;

    /// @notice Only limit order protocol can call this contract
    modifier onlyLimitOrderProtocol() {
        require(msg.sender == LIMIT_ORDER_PROTOCOL, "BaseExtension: unauthorized");
        _;
    }

    constructor(address limitOrderProtocol) {
        LIMIT_ORDER_PROTOCOL = limitOrderProtocol;
    }

    /// @inheritdoc IPostInteraction
    function postInteraction(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external virtual onlyLimitOrderProtocol {
        _postInteraction(order, extension, orderHash, taker, makingAmount, takingAmount, remainingMakingAmount, extraData);
    }

    /// @dev Internal implementation of post interaction logic
    function _postInteraction(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) internal virtual {
        // Base implementation - to be overridden by derived contracts
    }
}