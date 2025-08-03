import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { AmountGetterBase, AmountGetterBaseInterface } from "../../../../../contracts/ethereum/official-lop/extensions/AmountGetterBase";
type AmountGetterBaseConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AmountGetterBase__factory extends ContractFactory {
    constructor(...args: AmountGetterBaseConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<AmountGetterBase & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): AmountGetterBase__factory;
    static readonly bytecode = "0x60808060405234610016576104a6908161001c8239f35b600080fdfe6080604052600436101561001257600080fd5b60003560e01c80631d9671c3146100615763d7ff8a801461003257600080fd5b3461005c576020610054610045366100b1565b9796909695919594929461031d565b604051908152f35b600080fd5b3461005c576020610054610074366100b1565b9796909695919594929461025b565b9181601f8401121561005c5782359167ffffffffffffffff831161005c576020838186019501011161005c57565b9060031982016101c0811261005c576101001361005c5760049167ffffffffffffffff906101043582811161005c57816100ed91600401610083565b909390926101243592610144356001600160a01b038116810361005c5792610164359261018435926101a43591821161005c5761012c91600401610083565b9091565b6bffffffffffffffffffffffff19903581811693926014811061015257505050565b60140360031b82901b16169150565b90601f8019910116810190811067ffffffffffffffff82111761018357604052565b634e487b7160e01b600052604160045260246000fd5b908060209392818452848401376000828201840152601f01601f1916010190565b94916102589997949896936102259260e06101c09180358a52602081013560208b0152604081013560408b0152606081013560608b0152608081013560808b015260a081013560a08b015260c081013560c08b0152013560e089015280610100890152870191610199565b6101208501979097526001600160a01b03166101408401526101608301526101808201528084036101a090910152610199565b90565b91979496909594929160148410610301576102768483610130565b60601c958460141161005c576020986014966102b0956040519c8d9b8c9a8b9a631d9671c360e01b8c526013190198019660048b016101ba565b03915afa9081156102f5576000916102c6575090565b90506020813d6020116102ed575b816102e160209383610161565b8101031261005c575190565b3d91506102d4565b6040513d6000823e3d90fd5b9695505050505050610258925060a060c08301359201356103d2565b91979496909594929160148410610372576103388483610130565b60601c958460141161005c576020986014966102b0956040519c8d9b8c9a8b9a6301afff1560e71b8c526013190198019660048b016101ba565b975050505050505060a060c0830135920135906103908282856103d2565b9282156103bc5709151581018091116103a65790565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b909160001983830992808302928380861095039480860395146104625784831115610449579082910981600003821680920460028082600302188083028203028083028203028083028203028083028203028083028203028092029003029360018380600003040190848311900302920304170290565b82634e487b71600052156003026011186020526024601cfd5b5050809250156103bc57049056fea2646970667358221220c39bca177ae465e6dd1921838ea04aca4694688644e7e855d9c34c10f7f7cc4064736f6c63430008170033";
    static readonly abi: readonly [{
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
            readonly name: "extension";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "taker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "remainingMakingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "getMakingAmount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
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
            readonly name: "extension";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "taker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "remainingMakingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "getTakingAmount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): AmountGetterBaseInterface;
    static connect(address: string, runner?: ContractRunner | null): AmountGetterBase;
}
export {};
//# sourceMappingURL=AmountGetterBase__factory.d.ts.map