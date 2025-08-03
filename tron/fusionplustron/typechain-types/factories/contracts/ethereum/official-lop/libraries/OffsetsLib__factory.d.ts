import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { OffsetsLib, OffsetsLibInterface } from "../../../../../contracts/ethereum/official-lop/libraries/OffsetsLib";
type OffsetsLibConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class OffsetsLib__factory extends ContractFactory {
    constructor(...args: OffsetsLibConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<OffsetsLib & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): OffsetsLib__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea2646970667358221220346d2ffb03999d2a02bfb8ba1e3aab685ed7afaece920368d782353e93dac8f964736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "OffsetOutOfBounds";
        readonly type: "error";
    }];
    static createInterface(): OffsetsLibInterface;
    static connect(address: string, runner?: ContractRunner | null): OffsetsLib;
}
export {};
//# sourceMappingURL=OffsetsLib__factory.d.ts.map