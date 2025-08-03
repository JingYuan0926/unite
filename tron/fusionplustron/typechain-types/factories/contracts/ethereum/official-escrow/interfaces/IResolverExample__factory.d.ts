import { type ContractRunner } from "ethers";
import type { IResolverExample, IResolverExampleInterface } from "../../../../../contracts/ethereum/official-escrow/interfaces/IResolverExample";
export declare class IResolverExample__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "InvalidLength";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "LengthMismatch";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "targets";
            readonly type: "address[]";
        }, {
            readonly internalType: "bytes[]";
            readonly name: "arguments";
            readonly type: "bytes[]";
        }];
        readonly name: "arbitraryCalls";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "dstImmutables";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "srcCancellationTimestamp";
            readonly type: "uint256";
        }];
        readonly name: "deployDst";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "immutables";
            readonly type: "tuple";
        }, {
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
        readonly name: "deploySrc";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IResolverExampleInterface;
    static connect(address: string, runner?: ContractRunner | null): IResolverExample;
}
//# sourceMappingURL=IResolverExample__factory.d.ts.map