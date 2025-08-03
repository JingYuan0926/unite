import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { SeriesEpochManager, SeriesEpochManagerInterface } from "../../../../../contracts/ethereum/official-lop/helpers/SeriesEpochManager";
type SeriesEpochManagerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class SeriesEpochManager__factory extends ContractFactory {
    constructor(...args: SeriesEpochManagerConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<SeriesEpochManager & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): SeriesEpochManager__factory;
    static readonly bytecode = "0x608080604052346100165761027b908161001c8239f35b600080fdfe60806040818152600436101561001457600080fd5b600091823560e01c9081630d2c7c161461016b57508063c3cf8043146100f3578063ce3d710a146100b05763fcea9e4e1461004e57600080fd5b346100ac57806003193601126100ac5761006661022f565b6024356001600160601b03811681036100a8576001600160a01b0390911660a09190911b6001600160a01b031916178252602082815291819020549051908152f35b8380fd5b5080fd5b50346100ac5760603660031901126100ac576020916100cd61022f565b6001600160a01b031660243560a01b178152808352819020549051604435919091148152f35b50346100ac5760203660031901126100ac577f099133aefc2c2d1e56f8ef3622ec8e80979a0713fc9c4e1497740efcf809939661012e610214565b916001600160601b0360a01b8360a01b16331784528360205280842060018154018091556001600160601b0382519416845260208401523392a280f35b91905034610210578060031936011261021057610186610214565b916024359081158015610206575b6101f75750907f099133aefc2c2d1e56f8ef3622ec8e80979a0713fc9c4e1497740efcf8099396916001600160601b0360a01b8460a01b163317855284602052818520908154018091556001600160601b0382519416845260208401523392a280f35b63555fbbbf60e01b8152600490fd5b5060ff8211610194565b8280fd5b600435906001600160601b038216820361022a57565b600080fd5b600435906001600160a01b038216820361022a5756fea26469706673582212204e8d28d0bede4a65c658d2c403fe6b688e9dec595afd9c76c6948f70694d6fbf64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "AdvanceEpochFailed";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "series";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "newEpoch";
            readonly type: "uint256";
        }];
        readonly name: "EpochIncreased";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint96";
            readonly name: "series";
            readonly type: "uint96";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "advanceEpoch";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly internalType: "uint96";
            readonly name: "series";
            readonly type: "uint96";
        }];
        readonly name: "epoch";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "series";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "makerEpoch";
            readonly type: "uint256";
        }];
        readonly name: "epochEquals";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint96";
            readonly name: "series";
            readonly type: "uint96";
        }];
        readonly name: "increaseEpoch";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): SeriesEpochManagerInterface;
    static connect(address: string, runner?: ContractRunner | null): SeriesEpochManager;
}
export {};
//# sourceMappingURL=SeriesEpochManager__factory.d.ts.map