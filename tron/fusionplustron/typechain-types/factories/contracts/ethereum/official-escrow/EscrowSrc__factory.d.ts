import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, BigNumberish, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { EscrowSrc, EscrowSrcInterface } from "../../../../contracts/ethereum/official-escrow/EscrowSrc";
type EscrowSrcConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class EscrowSrc__factory extends ContractFactory {
    constructor(...args: EscrowSrcConstructorParams);
    getDeployTransaction(rescueDelay: BigNumberish, accessToken: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(rescueDelay: BigNumberish, accessToken: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<EscrowSrc & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): EscrowSrc__factory;
    static readonly bytecode = "0x6101003461011757601f610ba738819003918201601f19168301916001600160401b0383118484101761011c5780849260409485528339810103126101175780519063ffffffff82168092036101175760200151906001600160a01b0382168203610117573360c05260a0526080526e5af43d82803e903d91602b57fd5bf360205230601152763d602d80600a3d3981f3363d3d373d3d3d363d730000003060881c17600052603760092060e052604051610a749081610133823960805181818161010001526105ea015260a05181818160a101526103cf015260c0518181816104c00152818161081d015281816108aa0152610924015260e051818181610487015281816107f20152818161087f01526108f90152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608060408181526004918236101561001657600080fd5b60009260e0908435821c9283630af97558146105b15750826323305703146104ef5782632dd31000146104aa57826334862b6a1461046e5782634649088b146103795782636c10c0c81461027357826390d3252f1461021b578263daff233e146100c857505063f56cd69c1461008b57600080fd5b346100c457816003193601126100c457602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b5080fd5b91509134610217576101003660031901126102175780516370a0823160e01b815233838201526001600160a01b0393906020816024817f000000000000000000000000000000000000000000000000000000000000000089165afa90811561020d5786916101d7575b50156101c95763ffffffff60e43580921c9160601c1681018091116101b65742106101a957836101768461016361086a565b60a435908060443516906084351661095f565b61018260c435336109c8565b7f6e3be9294e58d10b9c8053cfd5e09871b67e442fe394d6b0870d336b9df984a98180a180f35b516337bf561360e11b8152fd5b634e487b7160e01b855260118352602485fd5b50516348f5c3ed60e01b8152fd5b90506020813d602011610205575b816101f26020938361075e565b81010312610201575138610131565b8580fd5b3d91506101e5565b83513d88823e3d90fd5b8380fd5b9150503461026f5761010036600319011261026f576001600160a01b0391606435831633036102625761024f60e435610796565b42106101a957836101768461016361086a565b516348f5c3ed60e01b8152fd5b8280fd5b8490843461026f5761014036600319011261026f578135916001600160a01b039060243590828216820361020157610100366043190112610201578260a43516330361036b57610124356102c6816107c6565b421061035c576102d590610796565b42101561034e576102e46107dd565b848652602086206064350361034057509161032b7fe346f5c97a360db5188bfa5d3ec5f0583abde420c6ba4d08b6cfe61addc17105949260209460e4359160c4351661095f565b61033861010435336109c8565b51908152a180f35b835163abab6bd760e01b8152fd5b83516337bf561360e11b8152fd5b5083516337bf561360e11b8152fd5b83516348f5c3ed60e01b8152fd5b8484833461026f5761014036600319011261026f576001600160a01b038435818116929083900361046a57602435916101003660431901126102015760a43516330361045a576103c76107dd565b61012435901c7f000000000000000000000000000000000000000000000000000000000000000001421061044a577fc4474c2790e13695f6d2b6f1d8e164290b55370f87a542fd7711abe0a1bf40ac939450811560001461043a5761042c81336109c8565b82519182526020820152a180f35b61044581338461095f565b61042c565b82516337bf561360e11b81528590fd5b83516348f5c3ed60e01b81528690fd5b8480fd5b505050346100c457816003193601126100c457602090517f00000000000000000000000000000000000000000000000000000000000000008152f35b505050346100c457816003193601126100c457517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b929150346102175761050036610736565b909390916001600160a01b0391906060840135831633036105a257830135610527816107c6565b421061035c5761053690610796565b42101561034e57610546836108e5565b8486526020862060208401350361034057509161033860c08361059a60209660a07fe346f5c97a360db5188bfa5d3ec5f0583abde420c6ba4d08b6cfe61addc171059997013590339060808501351661095f565b0135336109c8565b5083516348f5c3ed60e01b8152fd5b85918534610217576105c236610736565b6370a0823160e01b855233858501529560209491936001600160a01b039290919086816024817f000000000000000000000000000000000000000000000000000000000000000088165afa90811561072c5788916106fb575b50156106ec578088013580911c63ffffffff82881c1681018091116106d95742106106ca5761064990610796565b4210156106bc57610659876108e5565b83865284862085880135036106ae575060c08661059a6103389360a07fe346f5c97a360db5188bfa5d3ec5f0583abde420c6ba4d08b6cfe61addc17105999a013590806060850135169060808501351661095f565b825163abab6bd760e01b8152fd5b82516337bf561360e11b8152fd5b5082516337bf561360e11b8152fd5b634e487b7160e01b885260118352602488fd5b5082516348f5c3ed60e01b8152fd5b90508681813d8311610725575b610712818361075e565b8101031261072157518961061b565b8780fd5b503d610708565b85513d8a823e3d90fd5b906101206003198301126107595761010060043592602319011261075957602490565b600080fd5b90601f8019910116810190811067ffffffffffffffff82111761078057604052565b634e487b7160e01b600052604160045260246000fd5b63ffffffff8160e01c9160401c1681018091116107b05790565b634e487b7160e01b600052601160045260246000fd5b63ffffffff8160e01c911681018091116107b05790565b600b60405161010090816044823720604051907f0000000000000000000000000000000000000000000000000000000000000000604083015260208201527f000000000000000000000000000000000000000000000000000000000000000081520160ff8153605590206001600160a01b0316300361085857565b604051635134a42560e11b8152600490fd5b600b60405161010090816004823720604051907f0000000000000000000000000000000000000000000000000000000000000000604083015260208201527f000000000000000000000000000000000000000000000000000000000000000081520160ff8153605590206001600160a01b0316300361085857565b600b906040516101008092823720604051907f0000000000000000000000000000000000000000000000000000000000000000604083015260208201527f000000000000000000000000000000000000000000000000000000000000000081520160ff8153605590206001600160a01b0316300361085857565b9160446020926000926040519163a9059cbb60e01b83526004830152602482015282855af190816109a5575b501561099357565b60405163fb7f507960e01b8152600490fd5b90503d156109c05750600160005114601f3d11165b3861098b565b3b15156109ba565b60008080809481945af1903d15610a38573d9067ffffffffffffffff8211610a245760405191610a02601f8201601f19166020018461075e565b825260203d92013e5b15610a1257565b604051638a0332d560e01b8152600490fd5b634e487b7160e01b81526041600452602490fd5b50610a0b56fea2646970667358221220a74e9ef670e9730cc4996a0ed844d369a6676d997ca89ee75a4599270d39a89764736f6c63430008170033";
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
        readonly name: "publicCancel";
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
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "secret";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
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
        readonly name: "withdrawTo";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): EscrowSrcInterface;
    static connect(address: string, runner?: ContractRunner | null): EscrowSrc;
}
export {};
//# sourceMappingURL=EscrowSrc__factory.d.ts.map