import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { RemainingInvalidatorLib, RemainingInvalidatorLibInterface } from "../../../../../contracts/ethereum/official-lop/libraries/RemainingInvalidatorLib";
type RemainingInvalidatorLibConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class RemainingInvalidatorLib__factory extends ContractFactory {
    constructor(...args: RemainingInvalidatorLibConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<RemainingInvalidatorLib & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): RemainingInvalidatorLib__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212201bcbb3de21342a934c0b339b4571332c1cb15756f8bb938c5a2abbeffea6ee3164736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "RemainingInvalidatedOrder";
        readonly type: "error";
    }];
    static createInterface(): RemainingInvalidatorLibInterface;
    static connect(address: string, runner?: ContractRunner | null): RemainingInvalidatorLib;
}
export {};
//# sourceMappingURL=RemainingInvalidatorLib__factory.d.ts.map