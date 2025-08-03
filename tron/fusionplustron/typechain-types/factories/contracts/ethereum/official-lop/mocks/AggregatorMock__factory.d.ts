import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, BigNumberish, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { AggregatorMock, AggregatorMockInterface } from "../../../../../contracts/ethereum/official-lop/mocks/AggregatorMock";
type AggregatorMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class AggregatorMock__factory extends ContractFactory {
    constructor(...args: AggregatorMockConstructorParams);
    getDeployTransaction(answer: BigNumberish, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(answer: BigNumberish, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<AggregatorMock & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): AggregatorMock__factory;
    static readonly bytecode = "0x60a03461006857601f61041638819003918201601f19168301916001600160401b0383118484101761006d5780849260209460405283398101031261006857516080526040516103929081610084823960805181818161014a015281816102c001526103350152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060408181526004918236101561001657600080fd5b600092833560e01c918263313ce567146102e35750816350d25bcd146102a857816354fd4d501461028c578163668a0f02146102715781637284e416146101c55781638205bf6a146101a85781639a6fc8f51461016d578163b5ab58dc1461012a578163b633620c146100ef575063feaf968c1461009357600080fd5b346100eb57816003193601126100eb576100e7906100af610323565b945169ffffffffffffffffffff94851681526020810193909352604083019190915260608201529116608082015290819060a0820190565b0390f35b5080fd5b8284346101275760203660031901126101275750813561011b576020906101146102fe565b9051908152f35b5162bb258760e81b8152fd5b80fd5b8284346101275760203660031901126101275750813561011b57602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b8284346101275760203660031901126101275782359069ffffffffffffffffffff8216809203610127575061011b576100e7906100af610323565b5050346100eb57816003193601126100eb576020906101146102fe565b90503461026d578260031936011261026d578151908282019082821067ffffffffffffffff83111761025a57508252600e81526020906d41676772656761746f724d6f636b60901b6020820152825193849260208452825192836020860152825b84811061024457505050828201840152601f01601f19168101030190f35b8181018301518882018801528795508201610226565b634e487b7160e01b855260419052602484fd5b8280fd5b5050346100eb57816003193601126100eb5751908152602090f35b5050346100eb57816003193601126100eb576020905160018152f35b5050346100eb57816003193601126100eb57602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b8490346100eb57816003193601126100eb5780601260209252f35b606319420142811161030d5790565b634e487b7160e01b600052601160045260246000fd5b60631942019042821161030d576000917f000000000000000000000000000000000000000000000000000000000000000091819060009056fea264697066735822122017752a56a5790c7217a4789195dbba9423dc965f28890c1da544f9162c90126464736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "int256";
            readonly name: "answer";
            readonly type: "int256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "NoDataPresent";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "int256";
            readonly name: "current";
            readonly type: "int256";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "roundId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "updatedAt";
            readonly type: "uint256";
        }];
        readonly name: "AnswerUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "roundId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "startedBy";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "startedAt";
            readonly type: "uint256";
        }];
        readonly name: "NewRound";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "decimals";
        readonly outputs: readonly [{
            readonly internalType: "uint8";
            readonly name: "";
            readonly type: "uint8";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "description";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "roundId";
            readonly type: "uint256";
        }];
        readonly name: "getAnswer";
        readonly outputs: readonly [{
            readonly internalType: "int256";
            readonly name: "";
            readonly type: "int256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint80";
            readonly name: "_roundId";
            readonly type: "uint80";
        }];
        readonly name: "getRoundData";
        readonly outputs: readonly [{
            readonly internalType: "uint80";
            readonly name: "roundId";
            readonly type: "uint80";
        }, {
            readonly internalType: "int256";
            readonly name: "answer";
            readonly type: "int256";
        }, {
            readonly internalType: "uint256";
            readonly name: "startedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "updatedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint80";
            readonly name: "answeredInRound";
            readonly type: "uint80";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "roundId";
            readonly type: "uint256";
        }];
        readonly name: "getTimestamp";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "latestAnswer";
        readonly outputs: readonly [{
            readonly internalType: "int256";
            readonly name: "";
            readonly type: "int256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "latestRound";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "latestRoundData";
        readonly outputs: readonly [{
            readonly internalType: "uint80";
            readonly name: "roundId";
            readonly type: "uint80";
        }, {
            readonly internalType: "int256";
            readonly name: "answer";
            readonly type: "int256";
        }, {
            readonly internalType: "uint256";
            readonly name: "startedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "updatedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint80";
            readonly name: "answeredInRound";
            readonly type: "uint80";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "latestTimestamp";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "version";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): AggregatorMockInterface;
    static connect(address: string, runner?: ContractRunner | null): AggregatorMock;
}
export {};
//# sourceMappingURL=AggregatorMock__factory.d.ts.map