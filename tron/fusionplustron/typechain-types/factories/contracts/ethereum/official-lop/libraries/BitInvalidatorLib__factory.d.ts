import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { BitInvalidatorLib, BitInvalidatorLibInterface } from "../../../../../contracts/ethereum/official-lop/libraries/BitInvalidatorLib";
type BitInvalidatorLibConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class BitInvalidatorLib__factory extends ContractFactory {
    constructor(...args: BitInvalidatorLibConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<BitInvalidatorLib & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): BitInvalidatorLib__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea2646970667358221220443dd77b30dbb404a915aafda51a434dcd177cdeddb3e410aa069b11e41f4fc064736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "BitInvalidatedOrder";
        readonly type: "error";
    }];
    static createInterface(): BitInvalidatorLibInterface;
    static connect(address: string, runner?: ContractRunner | null): BitInvalidatorLib;
}
export {};
//# sourceMappingURL=BitInvalidatorLib__factory.d.ts.map