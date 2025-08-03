import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { Clones, ClonesInterface } from "../../../../@openzeppelin/contracts/proxy/Clones";
type ClonesConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Clones__factory extends ContractFactory {
    constructor(...args: ClonesConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<Clones & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): Clones__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212207955d2bb30b3dba6f0784e285003c25288848e01de3e8f544a9648c4ec6f3e1164736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "CloneArgumentsTooLong";
        readonly type: "error";
    }];
    static createInterface(): ClonesInterface;
    static connect(address: string, runner?: ContractRunner | null): Clones;
}
export {};
//# sourceMappingURL=Clones__factory.d.ts.map