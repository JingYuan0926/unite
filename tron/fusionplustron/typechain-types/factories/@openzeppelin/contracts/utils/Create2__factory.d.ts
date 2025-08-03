import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { Create2, Create2Interface } from "../../../../@openzeppelin/contracts/utils/Create2";
type Create2ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Create2__factory extends ContractFactory {
    constructor(...args: Create2ConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<Create2 & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): Create2__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212208c12fbbf3e32749c1d1d732bc2db07c588217ef1f8b8e20b6bd3037fe6845e7864736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "Create2EmptyBytecode";
        readonly type: "error";
    }];
    static createInterface(): Create2Interface;
    static connect(address: string, runner?: ContractRunner | null): Create2;
}
export {};
//# sourceMappingURL=Create2__factory.d.ts.map