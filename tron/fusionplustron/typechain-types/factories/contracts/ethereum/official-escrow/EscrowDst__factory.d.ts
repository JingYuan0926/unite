import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, BigNumberish, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { EscrowDst, EscrowDstInterface } from "../../../../contracts/ethereum/official-escrow/EscrowDst";
type EscrowDstConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class EscrowDst__factory extends ContractFactory {
    constructor(...args: EscrowDstConstructorParams);
    getDeployTransaction(rescueDelay: BigNumberish, accessToken: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(rescueDelay: BigNumberish, accessToken: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<EscrowDst & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): EscrowDst__factory;
    static readonly bytecode = "0x6101003461010f57601f6108fb38819003918201601f19168301916001600160401b0383118484101761011457808492604094855283398101031261010f5780519063ffffffff821680920361010f5760200151906001600160a01b038216820361010f573360c05260a0526080526e5af43d82803e903d91602b57fd5bf360205230601152763d602d80600a3d3981f3363d3d373d3d3d363d730000003060881c17600052603760092060e0526040516107d0908161012b82396080518161043b015260a051818181608a015261028d015260c0518181816101190152818161025701528181610377015261059a015260e05181818160ef0152818161022d0152818161033e01526105700152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060408181526004918236101561001657600080fd5b60009260e08435811c9283630af975581461040f5750826323305703146103a65782632dd310001461036157826334862b6a146103255782634649088b146101d05750816390d3252f146100b1575063f56cd69c1461007457600080fd5b346100ad57816003193601126100ad57602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b5080fd5b8383346100ad57610100806003193601126101cc576001600160a01b0391606435831691338390036101bc576055600b85928451818a8237208451907f00000000000000000000000000000000000000000000000000000000000000008683015260208201527f000000000000000000000000000000000000000000000000000000000000000081520160ff8153201630036101ad5761015260e43561066f565b421061019e57509061016b9160a435916084351661069f565b61017760c43533610724565b7f6e3be9294e58d10b9c8053cfd5e09871b67e442fe394d6b0870d336b9df984a98180a180f35b516337bf561360e11b81528490fd5b51635134a42560e11b81528490fd5b81516348f5c3ed60e01b81528690fd5b8280fd5b838591346101cc576101403660031901126101cc578335936001600160a01b038086169290919083870361032157602435926101008060431936011261031d578160a43516330361030d57600b60559188518160448237208851907f00000000000000000000000000000000000000000000000000000000000000008a83015260208201527f000000000000000000000000000000000000000000000000000000000000000081520160ff8153201630036102fe5761012435901c7f00000000000000000000000000000000000000000000000000000000000000000142106102f057506102e2817fc4474c2790e13695f6d2b6f1d8e164290b55370f87a542fd7711abe0a1bf40ac9596339061069f565b82519182526020820152a180f35b83516337bf561360e11b8152fd5b508351635134a42560e11b8152fd5b86516348f5c3ed60e01b81528490fd5b8780fd5b8580fd5b505050346100ad57816003193601126100ad57602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b505050346100ad57816003193601126100ad57517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b838591346101cc576103b7366104e4565b92909160608401356001600160a01b031633036101bc5763ffffffff8185013580921c9160801c1681018091116103fc57421061019e5750906103f991610544565b80f35b634e487b7160e01b855260118652602485fd5b90859185346104e057610421366104e4565b6370a0823160e01b845233878501529390926020816024817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156104d65786916104a4575b50156101bc5763ffffffff8185013580921c9160a01c1681018091116103fc57421061019e5750906103f991610544565b90506020813d6020116104ce575b816104bf6020938361050c565b81010312610321575187610473565b3d91506104b2565b83513d88823e3d90fd5b8380fd5b906101206003198301126105075761010060043592602319011261050757602490565b600080fd5b90601f8019910116810190811067ffffffffffffffff82111761052e57604052565b634e487b7160e01b600052604160045260246000fd5b9061055260e082013561066f565b42101561065d576040906055600b83516101009081858237208451907f00000000000000000000000000000000000000000000000000000000000000008683015260208201527f000000000000000000000000000000000000000000000000000000000000000081520160ff8153206001600160a01b03908116300361064c5783600052602060002060208301350361063b579161063460c08361062c60209660a07fe346f5c97a360db5188bfa5d3ec5f0583abde420c6ba4d08b6cfe61addc1710599970135908087850135169060808501351661069f565b013533610724565b51908152a1565b825163abab6bd760e01b8152600490fd5b8251635134a42560e11b8152600490fd5b6040516337bf561360e11b8152600490fd5b63ffffffff8160e01c9160c01c1681018091116106895790565b634e487b7160e01b600052601160045260246000fd5b6001600160a01b03169190826106bb576106b99250610724565b565b9060446020926000926040519163a9059cbb60e01b83526004830152602482015282855af19081610701575b50156106ef57565b60405163fb7f507960e01b8152600490fd5b90503d1561071c5750600160005114601f3d11165b386106e7565b3b1515610716565b60008080809481945af1903d15610794573d9067ffffffffffffffff8211610780576040519161075e601f8201601f19166020018461050c565b825260203d92013e5b1561076e57565b604051638a0332d560e01b8152600490fd5b634e487b7160e01b81526041600452602490fd5b5061076756fea26469706673582212202ca841ffd841c496045f91eab03a19363ed8b2a84c860731250d14ba4b2cb1ab64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint32";
            readonly name: "rescueDelay";
            readonly type: "uint32";
        }, {
            readonly internalType: "contract IERC20";
            readonly name: "accessToken";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidCaller";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidImmutables";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidSecret";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidTime";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NativeTokenSendingFailure";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafeTransferFailed";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [];
        readonly name: "EscrowCancelled";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "secret";
            readonly type: "bytes32";
        }];
        readonly name: "EscrowWithdrawal";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "FundsRescued";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "FACTORY";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "PROXY_BYTECODE_HASH";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESCUE_DELAY";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "immutables";
            readonly type: "tuple";
        }];
        readonly name: "cancel";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "secret";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "immutables";
            readonly type: "tuple";
        }];
        readonly name: "publicWithdraw";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "immutables";
            readonly type: "tuple";
        }];
        readonly name: "rescueFunds";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "secret";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "immutables";
            readonly type: "tuple";
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): EscrowDstInterface;
    static connect(address: string, runner?: ContractRunner | null): EscrowDst;
}
export {};
//# sourceMappingURL=EscrowDst__factory.d.ts.map