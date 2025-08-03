import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { UniERC20, UniERC20Interface } from "../../../../../@1inch/solidity-utils/contracts/libraries/UniERC20";
type UniERC20ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class UniERC20__factory extends ContractFactory {
    constructor(...args: UniERC20ConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<UniERC20 & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): UniERC20__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212204dbce5e09b7a6617d01ee82ddbf339c5475a3d9913ef2deb85d2068c70719ae864736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ApproveCalledOnETH";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ETHTransferFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "FromIsNotSender";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InsufficientBalance";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NotEnoughValue";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ToIsNotThis";
        readonly type: "error";
    }];
    static createInterface(): UniERC20Interface;
    static connect(address: string, runner?: ContractRunner | null): UniERC20;
}
export {};
//# sourceMappingURL=UniERC20__factory.d.ts.map