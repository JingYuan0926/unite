import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { InteractionMock, InteractionMockInterface } from "../../../../../contracts/ethereum/official-lop/mocks/InteractionMock";
type InteractionMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class InteractionMock__factory extends ContractFactory {
    constructor(...args: InteractionMockConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<InteractionMock & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): InteractionMock__factory;
    static readonly bytecode = "0x60808060405234610016576101ea908161001c8239f35b600080fdfe60808060405260048036101561001457600080fd5b600091823560e01c9081630986bdd5146100af575080631ae4f1b6146100915763462ebde21461004357600080fd5b3461008d57602061005336610132565b96509750509694505050501061007c57351061006d575080f35b60405163fb8ae12960e01b8152fd5b6040516319cd0c1f60e11b81528390fd5b5080fd5b503461008d57602036600319011261008d5760209060405190358152f35b9050346100fb576020906100c236610132565b965098975050979450505050106100ed575035036100de575080f35b60405163881db55160e01b8152fd5b6319cd0c1f60e11b81528390fd5b8280fd5b9181601f8401121561012d5782359167ffffffffffffffff831161012d576020838186019501011161012d57565b600080fd5b60031981016101e0811261012d576101001361012d5760049167ffffffffffffffff6101043581811161012d578361016c916004016100ff565b909390926101243592610144356001600160a01b038116810361012d5792610164359261018435926101a435926101c43591821161012d576101b0916004016100ff565b909156fea2646970667358221220dd3dd07013677f6cb5e5f1d4e3ca1b3ab0021dcc2dc25f308a4c232cbf23825464736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "IncorrectTakingAmount";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidExtraDataLength";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TakingAmountTooHigh";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "arg";
            readonly type: "uint256";
        }];
        readonly name: "copyArg";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "postInteraction";
        readonly outputs: readonly [];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "preInteraction";
        readonly outputs: readonly [];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): InteractionMockInterface;
    static connect(address: string, runner?: ContractRunner | null): InteractionMock;
}
export {};
//# sourceMappingURL=InteractionMock__factory.d.ts.map