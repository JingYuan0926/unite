import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { TronClonesTest, TronClonesTestInterface } from "../../../../../contracts/tron/test/TronClonesTest.sol/TronClonesTest";
type TronClonesTestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TronClonesTest__factory extends ContractFactory {
    constructor(...args: TronClonesTestConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<TronClonesTest & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): TronClonesTest__factory;
    static readonly bytecode = "0x60a0806040523461008d5760e48181016001600160401b038111838210176100775782916105ed833903906000f0801561006b576001600160a01b031660805260405161055a90816100938239608051818181606d015281816101b10152818161032901526103aa0152f35b6040513d6000823e3d90fd5b634e487b7160e01b600052604160045260246000fd5b600080fdfe6040608081526004908136101561001557600080fd5b600090813560e01c80633a4741bd146103945780636288999f146102ed578063a06dc5a71461019f578063aaf10f421461019a5763d9c10cd41461005857600080fd5b346101965760203660031901126101965782357f000000000000000000000000000000000000000000000000000000000000000092610096846103de565b60208151910120948351916020830196604160f81b88523060601b6021850152846035850152605584015260558352608083019183831067ffffffffffffffff8411176101835750508352519093206001600160a01b03939084169261017f929161010a91610104906103de565b90610465565b81516001600160a01b0385811682528216602082015294811684146040860181905290949091907f26672e3051891a5f29205666c09d30f303ddb930d63259791d44a68408cfc6be90606090a1516001600160a01b039384168152939092166020840152901515604083015281906060820190565b0390f35b634e487b7160e01b825260419052602490fd5b5080fd5b610394565b50919060203660031901126102ea57507f000000000000000000000000000000000000000000000000000000000000000081356101db826103de565b8051156102a7578051829160200134f56001600160a01b038116939091908415610252575084516001600160a01b03928316815292909116602080840191909152604083019190915292907f941d000beaafd3da64f1e7e142e0623376d5598140b919ac3e5a51efa25c18fd90606090a151908152f35b608490602087519162461bcd60e51b8352820152602960248201527f54726f6e437265617465324c69623a2043726561746532206465706c6f796d656044820152681b9d0819985a5b195960ba1b6064820152fd5b845162461bcd60e51b8152602081860152601e60248201527f54726f6e437265617465324c69623a20456d7074792062797465636f646500006044820152606490fd5b80fd5b508234610390576020366003190112610390576020925035907f941d000beaafd3da64f1e7e142e0623376d5598140b919ac3e5a51efa25c18fd7f00000000000000000000000000000000000000000000000000000000000000009261035b610355856103de565b82610465565b83516001600160a01b038281168252959095166020860152604085019190915292606090a1516001600160a01b039091168152f35b8280fd5b346103d95760003660031901126103d9576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b600080fd5b604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b6020820152606091821b6bffffffffffffffffffffffff191660348201526e5af43d82803e903d91602b57fd5bf360881b60488201526037815290810167ffffffffffffffff81118282101761044f5760405290565b634e487b7160e01b600052604160045260246000fd5b908051156104df576020815191016000f5906001600160a01b0382161561048857565b60405162461bcd60e51b815260206004820152602960248201527f54726f6e437265617465324c69623a2043726561746532206465706c6f796d656044820152681b9d0819985a5b195960ba1b6064820152608490fd5b60405162461bcd60e51b815260206004820152601e60248201527f54726f6e437265617465324c69623a20456d7074792062797465636f646500006044820152606490fdfea2646970667358221220b64dee7497825d937968baba84c1db765bcd6ab7d837c681d121a3d827c09fe364736f6c63430008170033608080604052346100155760c9908161001b8239f35b600080fdfe6080806040526004361015601b575b503615601957600080fd5b005b600090813560e01c90816320965255146077575080633fa4f24514605c57635524107703600e57346059576020366003190112605957600435815580f35b80fd5b50346059578060031936011260595760209054604051908152f35b905034608f5781600319360112608f57602091548152f35b5080fdfea2646970667358221220e2220cf52f255a287214c35f533aa8b81a6900a532cfa2a0357bcaf546abd04464736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "predicted";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "actual";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "matches";
            readonly type: "bool";
        }];
        readonly name: "AddressPredicted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "clone";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "implementation";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }];
        readonly name: "CloneDeployed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "IMPLEMENTATION";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }];
        readonly name: "testAddressPrediction";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "predicted";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "actual";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "matches";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "salt";
            readonly type: "bytes32";
        }];
        readonly name: "testCloneDeterministic";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "clone";
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
        readonly name: "testCloneWithValue";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "clone";
            readonly type: "address";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): TronClonesTestInterface;
    static connect(address: string, runner?: ContractRunner | null): TronClonesTest;
}
export {};
//# sourceMappingURL=TronClonesTest__factory.d.ts.map