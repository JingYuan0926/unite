import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { ExtensionMock, ExtensionMockInterface } from "../../../../../contracts/ethereum/official-lop/mocks/ExtensionMock";
type ExtensionMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ExtensionMock__factory extends ContractFactory {
    constructor(...args: ExtensionMockConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ExtensionMock & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): ExtensionMock__factory;
    static readonly bytecode = "0x608080604052346100165761010e908161001c8239f35b600080fdfe6080806040526004361015601257600080fd5b6000803560e01c63d0cfe3ab14602757600080fd5b3460a057602036600319011260a05767ffffffffffffffff600435818111609c5736602382011215609c578060040135918211609c573660248383010111609c57916077849260246040950160a3565b8092916020855281602086015285850137828201840152601f01601f19168101030190f35b8280fd5b80fd5b91906020811060cf57823560e01c9281846020011160ca578301602001929003601f190190565b600080fd5b5060009150819056fea2646970667358221220eb333da23ab96a3cfbecf9fd390bd425ac18ea299dac66829e7c5b81b852aab264736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "extension";
            readonly type: "bytes";
        }];
        readonly name: "getCustomData";
        readonly outputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): ExtensionMockInterface;
    static connect(address: string, runner?: ContractRunner | null): ExtensionMock;
}
export {};
//# sourceMappingURL=ExtensionMock__factory.d.ts.map