import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { SeriesNonceManager, SeriesNonceManagerInterface } from "../../../../../contracts/ethereum/official-lop/helpers/SeriesNonceManager";
type SeriesNonceManagerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class SeriesNonceManager__factory extends ContractFactory {
    constructor(...args: SeriesNonceManagerConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<SeriesNonceManager & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): SeriesNonceManager__factory;
    static readonly bytecode = "0x60808060405234610016576102fa908161001c8239f35b600080fdfe6040608081526004908136101561001557600080fd5b6000803560e01c80632cc2878d1461023b5780634a7f2a4b146101fa5780635d3a09dc1461015d57806363592c2b1461013c5780637a37dc2c146100b95763976222211461006257600080fd5b346100b65760603660031901126100b657506100ad6020926100826102a9565b6044359135600052600060205260406000209060018060a01b03166000526020526040600020541490565b90519015158152f35b80fd5b509134610138576020908160031936011261013457359160ff8316809303610134577fdc0537f71d06d3708f52baf4ddf6918b25f1a145ba08873de27485682b35cac191838552848152818520338652815260018286205401908486528581528286203387528152818387205582519485528401523392a280f35b8380fd5b8280fd5b50919034610138576020366003190112610138576020925051903542108152f35b5091903461013857806003193601126101385781359160243590811580156101f0575b6101e25750907fdc0537f71d06d3708f52baf4ddf6918b25f1a145ba08873de27485682b35cac191838552846020528185203386526020528185205401838552846020528185203386526020528082862055815193845260208401523392a280f35b825163bd71636d60e01b8152fd5b5060ff8211610180565b50913461013857816003193601126101385760209282916102196102a9565b903582528185528282206001600160a01b039091168252845220549051908152f35b509134610138576020366003190112610138576020925035908160d81c4210918261026a575b50519015158152f35b60a081901c61ffff166000908152602081815260408083206001600160a01b038516845290915290205491925060b01c64ffffffffff16149038610261565b602435906001600160a01b03821682036102bf57565b600080fdfea264697066735822122066aee17e9df43e819c5ff52e2ae408aec63fa973dbe8deacda52141aca0a3d0164736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "AdvanceNonceFailed";
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
            readonly name: "newNonce";
            readonly type: "uint256";
        }];
        readonly name: "NonceIncreased";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "series";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "advanceNonce";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint8";
            readonly name: "series";
            readonly type: "uint8";
        }];
        readonly name: "increaseNonce";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "series";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "maker";
            readonly type: "address";
        }];
        readonly name: "nonce";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "nonce";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "series";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "makerAddress";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "makerNonce";
            readonly type: "uint256";
        }];
        readonly name: "nonceEquals";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "time";
            readonly type: "uint256";
        }];
        readonly name: "timestampBelow";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "timeNonceSeriesAccount";
            readonly type: "uint256";
        }];
        readonly name: "timestampBelowAndNonceEquals";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): SeriesNonceManagerInterface;
    static connect(address: string, runner?: ContractRunner | null): SeriesNonceManager;
}
export {};
//# sourceMappingURL=SeriesNonceManager__factory.d.ts.map