import { type ContractRunner } from "ethers";
import type { IOrderMixin, IOrderMixinInterface } from "../../../../../contracts/ethereum/official-lop/interfaces/IOrderMixin";
export declare class IOrderMixin__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "BadSignature";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "EpochManagerAndBitInvalidatorsAreIncompatible";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidPermit2Transfer";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidatedOrder";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "MakingAmountTooLow";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "MismatchArraysLengths";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "OrderExpired";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "OrderIsNotSuitableForMassInvalidation";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "PartialFillNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "PredicateIsNotTrue";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "PrivateOrder";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ReentrancyDetected";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success";
            readonly type: "bool";
        }, {
            readonly internalType: "bytes";
            readonly name: "res";
            readonly type: "bytes";
        }];
        readonly name: "SimulationResults";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SwapWithZeroAmount";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TakingAmountExceeded";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TakingAmountTooHigh";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TransferFromMakerToTakerFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TransferFromTakerToMakerFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongSeriesNonce";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "slotIndex";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "slotValue";
            readonly type: "uint256";
        }];
        readonly name: "BitInvalidatorUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly name: "OrderCancelled";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "remainingAmount";
            readonly type: "uint256";
        }];
        readonly name: "OrderFilled";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "slot";
            readonly type: "uint256";
        }];
        readonly name: "bitInvalidatorForOrder";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "result";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "MakerTraits";
            readonly name: "makerTraits";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "additionalMask";
            readonly type: "uint256";
        }];
        readonly name: "bitsInvalidateForOrder";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "MakerTraits";
            readonly name: "makerTraits";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly name: "cancelOrder";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "MakerTraits[]";
            readonly name: "makerTraits";
            readonly type: "uint256[]";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "orderHashes";
            readonly type: "bytes32[]";
        }];
        readonly name: "cancelOrders";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "TakerTraits";
            readonly name: "takerTraits";
            readonly type: "uint256";
        }];
        readonly name: "fillContractOrder";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "TakerTraits";
            readonly name: "takerTraits";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "args";
            readonly type: "bytes";
        }];
        readonly name: "fillContractOrderArgs";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "r";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "vs";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "TakerTraits";
            readonly name: "takerTraits";
            readonly type: "uint256";
        }];
        readonly name: "fillOrder";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "r";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "vs";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "TakerTraits";
            readonly name: "takerTraits";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "args";
            readonly type: "bytes";
        }];
        readonly name: "fillOrderArgs";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "order";
            readonly type: "tuple";
        }];
        readonly name: "hashOrder";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly name: "rawRemainingInvalidatorForOrder";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "remainingRaw";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }];
        readonly name: "remainingInvalidatorForOrder";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "remaining";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "simulate";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IOrderMixinInterface;
    static connect(address: string, runner?: ContractRunner | null): IOrderMixin;
}
//# sourceMappingURL=IOrderMixin__factory.d.ts.map