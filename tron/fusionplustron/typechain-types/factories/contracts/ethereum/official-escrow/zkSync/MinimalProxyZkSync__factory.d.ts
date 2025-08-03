import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { PayableOverrides } from "../../../../../common";
import type { MinimalProxyZkSync, MinimalProxyZkSyncInterface } from "../../../../../contracts/ethereum/official-escrow/zkSync/MinimalProxyZkSync";
type MinimalProxyZkSyncConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MinimalProxyZkSync__factory extends ContractFactory {
    constructor(...args: MinimalProxyZkSyncConstructorParams);
    getDeployTransaction(implementation: AddressLike, overrides?: PayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(implementation: AddressLike, overrides?: PayableOverrides & {
        from?: string;
    }): Promise<MinimalProxyZkSync & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): MinimalProxyZkSync__factory;
    static readonly bytecode = "0x60a0601f6100f638819003918201601f19168301916001600160401b038311848410176100685780849260209460405283398101031261006357516001600160a01b0381168103610063576080526040516077908161007f82396080518160100152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe6080604052600036818037808036817f00000000000000000000000000000000000000000000000000000000000000005af43d82803e15603d573d90f35b3d90fdfea264697066735822122055c87c8fe4745171c04a045085faa48412430cb819aa66ceae43fdb00bb0c21764736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "implementation";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "constructor";
    }, {
        readonly stateMutability: "payable";
        readonly type: "fallback";
    }];
    static createInterface(): MinimalProxyZkSyncInterface;
    static connect(address: string, runner?: ContractRunner | null): MinimalProxyZkSync;
}
export {};
//# sourceMappingURL=MinimalProxyZkSync__factory.d.ts.map