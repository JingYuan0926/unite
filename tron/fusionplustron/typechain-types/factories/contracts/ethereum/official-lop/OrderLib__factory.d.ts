import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { OrderLib, OrderLibInterface } from "../../../../contracts/ethereum/official-lop/OrderLib";
type OrderLibConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class OrderLib__factory extends ContractFactory {
    constructor(...args: OrderLibConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<OrderLib & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): OrderLib__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212203deb4032155affd322dd07bb78337529a24c7719b17cb3e7078fe7a8d87e1d9964736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "InvalidExtensionHash";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "MissingOrderExtension";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "UnexpectedOrderExtension";
        readonly type: "error";
    }];
    static createInterface(): OrderLibInterface;
    static connect(address: string, runner?: ContractRunner | null): OrderLib;
}
export {};
//# sourceMappingURL=OrderLib__factory.d.ts.map