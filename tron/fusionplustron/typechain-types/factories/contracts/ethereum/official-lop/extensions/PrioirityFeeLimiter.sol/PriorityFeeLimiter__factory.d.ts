import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../../common";
import type { PriorityFeeLimiter, PriorityFeeLimiterInterface } from "../../../../../../contracts/ethereum/official-lop/extensions/PrioirityFeeLimiter.sol/PriorityFeeLimiter";
type PriorityFeeLimiterConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class PriorityFeeLimiter__factory extends ContractFactory {
    constructor(...args: PriorityFeeLimiterConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<PriorityFeeLimiter & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): PriorityFeeLimiter__factory;
    static readonly bytecode = "0x608080604052346100155760c0908161001b8239f35b600080fdfe6080806040526004361015601257600080fd5b600090813560e01c630202470814602857600080fd5b3460455781600319360112604557602090603f6049565b15158152f35b5080fd5b483a03640277cf2a0048106000146067576064604648029102111590565b64183cd7f100481015607d57489060011b111590565b606460414802910211159056fea26469706673582212206e92816baae7f51af40aedf413dee454a5ea8c0bd82000197a9c57f3634158ef64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "isPriorityFeeValid";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): PriorityFeeLimiterInterface;
    static connect(address: string, runner?: ContractRunner | null): PriorityFeeLimiter;
}
export {};
//# sourceMappingURL=PriorityFeeLimiter__factory.d.ts.map