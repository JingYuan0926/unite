import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { TronCreate2Test, TronCreate2TestInterface } from "../../../../contracts/tron/test/TronCreate2Test";
type TronCreate2TestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TronCreate2Test__factory extends ContractFactory {
    constructor(...args: TronCreate2TestConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<TronCreate2Test & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): TronCreate2Test__factory;
    static readonly bytecode = "0x60808060405234610016576103e7908161001c8239f35b600080fdfe604060808152600436101561001357600080fd5b6000803560e01c80636e30b780146102b157806370bf08b9146100b75763bf41b2321461003f57600080fd5b346100b4575061004e36610313565b9061005a308383610360565b91835190602082019260ff60f81b84526bffffffffffffffffffffffff193060601b16602184015260358301526055820152605581526100998161032e565b51902082516001600160a01b03928316815291166020820152f35b80fd5b5090346102ad5760203660031901126102ad576004358151926080840184811067ffffffffffffffff82111761029957835260548452602084017f608060405234801561001057600080fd5b50600a80601d6000396000f3fe608081527f604052600080fdfea2646970667358221220123456789012345678901234567884860152731202468acf1202468acf1202468acf1202468acf60631b606086015261016560548220309085610360565b94805115610255575191f5906001600160a01b038083169081156101ff5782516001600160a01b0385811682528616602082015290851691909114604082018190526101fb9290917f56e144be98ac193f43ef0c42f0c867bb2f5f9e9117e03139057e445d43ffd01990606090a1516001600160a01b039384168152939092166020840152901515604083015281906060820190565b0390f35b825162461bcd60e51b815260206004820152602960248201527f54726f6e437265617465324c69623a2043726561746532206465706c6f796d656044820152681b9d0819985a5b195960ba1b6064820152608490fd5b845162461bcd60e51b815260206004820152601e60248201527f54726f6e437265617465324c69623a20456d7074792062797465636f646500006044820152606490fd5b634e487b7160e01b82526041600452602482fd5b5080fd5b50346100b45760206060837f57139f609b08b2e7889ce29863f428477924461b5f2188f1a5ba03a732205eba6102e636610313565b6102f4949194308287610360565b9084519160018060a01b0316958683528783015284820152a151908152f35b6040906003190112610329576004359060243590565b600080fd5b6080810190811067ffffffffffffffff82111761034a57604052565b634e487b7160e01b600052604160045260246000fd5b9190604051926020840192604160f81b84526bffffffffffffffffffffffff199060601b16602185015260358401526055830152605582526103a18261032e565b905190206001600160a01b03169056fea264697066735822122099529105eaa500afbf0121d02729ab93b05e85454ee58d40f4a04be0fe6a9f8764736f6c63430008170033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "computed";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "bytecodeHash";
            readonly type: "bytes32";
        }];
        readonly name: "AddressComputed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "deployed";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "expected";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "matches";
            readonly type: "bool";
        }];
        readonly name: "DeploymentTest";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "bytecodeHash";
            readonly type: "bytes32";
        }];
        readonly name: "compareCreate2Methods";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "tronAddress";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "ethereumAddress";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "bytecodeHash";
            readonly type: "bytes32";
        }];
        readonly name: "testComputeAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "computed";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }];
        readonly name: "testDeployment";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "deployed";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "expected";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "matches";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): TronCreate2TestInterface;
    static connect(address: string, runner?: ContractRunner | null): TronCreate2Test;
}
export {};
//# sourceMappingURL=TronCreate2Test__factory.d.ts.map