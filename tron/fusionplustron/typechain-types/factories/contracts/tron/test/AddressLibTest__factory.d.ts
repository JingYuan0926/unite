import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { AddressLibTest, AddressLibTestInterface } from "../../../../contracts/tron/test/AddressLibTest";
type AddressLibTestConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AddressLibTest__factory extends ContractFactory {
    constructor(...args: AddressLibTestConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<AddressLibTest & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): AddressLibTest__factory;
    static readonly bytecode = "0x60808060405234610016576101ce908161001c8239f35b600080fdfe60806040818152600436101561001457600080fd5b600091823560e01c9081633cff6cb414610126575080636f8f87d2146100ff578063ebec038c146100955763fa5d5ae71461004e57600080fd5b346100915760603660031901126100915780516001600160a01b036004358116825260243581166020830152604435169181019190915260016060820152608090f35b5080fd5b5090346100fc5760203660031901126100fc575080516004358082526001600160a01b031660208201819052600182840152907fe2c3e0a6749e15082ef7af7459d5ac64e533c8c0a760a084a2fda389e0776e2590606090a1815190815260016020820152f35b80fd5b50346100915781600319360112610091579060018260609351928084526020840152820152f35b83915034610091576020366003190112610091576004356001600160a01b03811692908390036100fc57506060927fdd3068fb483aff9de47be875253bca57ba83b4a9e813d620d6bdece8400be83a848385600195528560208201528584820152a18051928084526020840152820152f3fea264697066735822122033e1d782f24a3c39f6e9a5417419f1d6dac3a1f4e01665ffba65c22993a41ed964736f6c63430008170033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "input";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "output";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "success";
            readonly type: "bool";
        }];
        readonly name: "AddressConversion";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "input";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "output";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "reconverted";
            readonly type: "address";
        }];
        readonly name: "AddressValidation";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "addressAsUint";
            readonly type: "uint256";
        }];
        readonly name: "testAddressGet";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "converted";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "success";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "token";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maker";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "taker";
            readonly type: "uint256";
        }];
        readonly name: "testMultipleConversions";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "tokenAddr";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "makerAddr";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "takerAddr";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "allSuccess";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "inputAddress";
            readonly type: "address";
        }];
        readonly name: "testRoundTripConversion";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "output";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "reconverted";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "matches";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "testZeroAddress";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "zeroAsUint";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "convertedBack";
            readonly type: "address";
        }, {
            readonly internalType: "bool";
            readonly name: "isZero";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): AddressLibTestInterface;
    static connect(address: string, runner?: ContractRunner | null): AddressLibTest;
}
export {};
//# sourceMappingURL=AddressLibTest__factory.d.ts.map