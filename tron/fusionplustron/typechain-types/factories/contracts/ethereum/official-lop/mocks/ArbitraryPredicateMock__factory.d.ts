import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { ArbitraryPredicateMock, ArbitraryPredicateMockInterface } from "../../../../../contracts/ethereum/official-lop/mocks/ArbitraryPredicateMock";
type ArbitraryPredicateMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ArbitraryPredicateMock__factory extends ContractFactory {
    constructor(...args: ArbitraryPredicateMockConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ArbitraryPredicateMock & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): ArbitraryPredicateMock__factory;
    static readonly bytecode = "0x60808060405234601457607a908161001a8239f35b600080fdfe6080806040526004361015601257600080fd5b60003560e01c631ae4f1b614602657600080fd5b34603f576020366003190112603f576020906004358152f35b600080fdfea2646970667358221220d888c07fb887664c9ecf1baf5241d7ded65b2a3ece5243c1d21cf0d8295aa8c964736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "arg";
            readonly type: "uint256";
        }];
        readonly name: "copyArg";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): ArbitraryPredicateMockInterface;
    static connect(address: string, runner?: ContractRunner | null): ArbitraryPredicateMock;
}
export {};
//# sourceMappingURL=ArbitraryPredicateMock__factory.d.ts.map