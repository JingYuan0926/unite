import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { NoReceiveCaller, NoReceiveCallerInterface } from "../../../../../contracts/ethereum/official-escrow/mocks/NoReceiveCaller";
type NoReceiveCallerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class NoReceiveCaller__factory extends ContractFactory {
    constructor(...args: NoReceiveCallerConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<NoReceiveCaller & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): NoReceiveCaller__factory;
    static readonly bytecode = "0x608080604052346100165761015b908161001c8239f35b600080fdfe608080604052600436101561001357600080fd5b600090813560e01c632154bf281461002a57600080fd5b3461012157604036600319011261012157816004356001600160a01b0381168103610121576024359067ffffffffffffffff9384831161011d573660238401121561011d57826004013585811161011957366024828601011161011957818186959260248794018337810182815203925af1903d15610113573d8181116100ff5760405191601f8201601f19908116603f01168301908111838210176100eb5760405281528260203d92013e5b156100df5780f35b604051903d90823e3d90fd5b634e487b7160e01b85526041600452602485fd5b634e487b7160e01b84526041600452602484fd5b506100d7565b8480fd5b8380fd5b5080fdfea26469706673582212200b35f6a0962a01f67de5aef1e48abe84fb4b87d35584123bab2241a622ad06f664736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "arguments";
            readonly type: "bytes";
        }];
        readonly name: "arbitraryCall";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): NoReceiveCallerInterface;
    static connect(address: string, runner?: ContractRunner | null): NoReceiveCaller;
}
export {};
//# sourceMappingURL=NoReceiveCaller__factory.d.ts.map