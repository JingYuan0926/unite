import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { SimpleImplementation, SimpleImplementationInterface } from "../../../../../contracts/tron/test/TronClonesTest.sol/SimpleImplementation";
type SimpleImplementationConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class SimpleImplementation__factory extends ContractFactory {
    constructor(...args: SimpleImplementationConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<SimpleImplementation & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): SimpleImplementation__factory;
    static readonly bytecode = "0x608080604052346100155760c9908161001b8239f35b600080fdfe6080806040526004361015601b575b503615601957600080fd5b005b600090813560e01c90816320965255146077575080633fa4f24514605c57635524107703600e57346059576020366003190112605957600435815580f35b80fd5b50346059578060031936011260595760209054604051908152f35b905034608f5781600319360112608f57602091548152f35b5080fdfea2646970667358221220e2220cf52f255a287214c35f533aa8b81a6900a532cfa2a0357bcaf546abd04464736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "getValue";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }];
        readonly name: "setValue";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "value";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): SimpleImplementationInterface;
    static connect(address: string, runner?: ContractRunner | null): SimpleImplementation;
}
export {};
//# sourceMappingURL=SimpleImplementation__factory.d.ts.map