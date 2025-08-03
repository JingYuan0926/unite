import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { DutchAuctionCalculator, DutchAuctionCalculatorInterface } from "../../../../../contracts/ethereum/official-lop/extensions/DutchAuctionCalculator";
type DutchAuctionCalculatorConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DutchAuctionCalculator__factory extends ContractFactory {
    constructor(...args: DutchAuctionCalculatorConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<DutchAuctionCalculator & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): DutchAuctionCalculator__factory;
    static readonly bytecode = "0x60808060405234610016576102b3908161001c8239f35b600080fdfe6080604052600436101561001257600080fd5b6000803560e01c80631d9671c3146100a95763d7ff8a801461003357600080fd5b346100a65761005f60a061006a61006561004c36610123565b94509450509594989350508101906101a2565b91610213565b6101bd565b9101359182156100945750600161008760209360001984016101e6565b0190151502604051908152f35b634e487b71905260126020526024601cfd5b80fd5b50346100a65760206100e861005f6100e36100db60a06100c836610123565b94509450509694989350508101906101a2565b9301356101bd565b6101e6565b604051908152f35b9181601f8401121561011e5782359167ffffffffffffffff831161011e576020838186019501011161011e57565b600080fd5b9060031982016101c0811261011e576101001361011e5760049167ffffffffffffffff906101043582811161011e578161015f916004016100f0565b909390926101243592610144356001600160a01b038116810361011e5792610164359261018435926101a43591821161011e5761019e916004016100f0565b9091565b9081606091031261011e578035916040602083013592013590565b818102929181159184041417156101d057565b634e487b7160e01b600052601160045260246000fd5b81156101f0570490565b634e487b7160e01b600052601260045260246000fd5b919082039182116101d057565b9161025e6fffffffffffffffffffffffffffffffff8460801c941691610252856102584286104287180242188083118184180218966102528888610206565b906101bd565b95610206565b82018092116101d05761027a9261027491610206565b906101e6565b9056fea2646970667358221220fbe85279aff629b38585f24901034abce2fb0c4aa73307844a24c8c183490fe064736f6c63430008170033";
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
            readonly name: "";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
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
            readonly name: "";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
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
    static createInterface(): DutchAuctionCalculatorInterface;
    static connect(address: string, runner?: ContractRunner | null): DutchAuctionCalculator;
}
export {};
//# sourceMappingURL=DutchAuctionCalculator__factory.d.ts.map