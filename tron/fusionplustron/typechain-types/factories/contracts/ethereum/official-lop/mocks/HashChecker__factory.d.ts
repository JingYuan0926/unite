import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { HashChecker, HashCheckerInterface } from "../../../../../contracts/ethereum/official-lop/mocks/HashChecker";
type HashCheckerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class HashChecker__factory extends ContractFactory {
    constructor(...args: HashCheckerConstructorParams);
    getDeployTransaction(limitOrderProtocol: AddressLike, owner_: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(limitOrderProtocol: AddressLike, owner_: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<HashChecker & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): HashChecker__factory;
    static readonly bytecode = "0x60a06040908082523461017157818161073b80380380916100208285610176565b83398101031261017157610033816101af565b6020916001600160a01b039190829061004d9085016101af565b1690811561015957600080546001600160a01b0319811684178255865194919391167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08480a3633644e51560e01b838501908152600484526001600160401b03938681018581118282101761014557875251839283929083905af1503d1561013c573d918211610128578351916100ed601f8201601f1916850184610176565b82523d818484013e5b8282805181010312610125575001516080525161057790816101c482396080518181816101ac01526102920152f35b80fd5b634e487b7160e01b81526041600452602490fd5b606091506100f6565b634e487b7160e01b85526041600452602485fd5b8451631e4fbdf760e01b815260006004820152602490fd5b600080fd5b601f909101601f19168101906001600160401b0382119082101761019957604052565b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101715756fe608080604052600436101561001357600080fd5b600090813560e01c9081630986bdd5146102b5575080631b1e71d41461027a578063715018a6146102205780638da5cb5b146101f9578063bf325fbc14610136578063d658d2e9146101075763f2fde38b1461006e57600080fd5b34610104576020366003190112610104576004356001600160a01b03818116918290036100ff5761009d610515565b81156100e657600054826bffffffffffffffffffffffff60a01b821617600055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a380f35b604051631e4fbdf760e01b815260048101849052602490fd5b600080fd5b80fd5b50346101045760203660031901126101045760ff60406020926004358152600184522054166040519015158152f35b50346101045761012036600319018181126101f5576101008091126101f55761010435918215158093036101f15760429161016f610515565b604051907f3af21ec5a20011b88d3b7b4ed7c806cef05a5980cf34974bcd53566a131f7e4c825260046020830137206040519061190160f01b82527f0000000000000000000000000000000000000000000000000000000000000000600283015260228201522082526001602052604082209060ff8019835416911617905580f35b8380fd5b8280fd5b5034610104578060031936011261010457546040516001600160a01b039091168152602090f35b5034610104578060031936011261010457610239610515565b600080546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b503461010457806003193601126101045760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b82346101045736600319016101e081126104c25761010013610104576101043567ffffffffffffffff81116104c2576102f29036906004016104c6565b61014435906001600160a01b03821682036101f1576101c43567ffffffffffffffff81116104be576103289036906004016104c6565b939092610124358652600160205260ff604087205416156104af57859650849594610351578480f35b8335926bffffffffffffffffffffffff198085169460148910610499575b505086601411610495578360601c3b156104955761044386926103f69660146040519a8b998a988997630986bdd560e01b895260043560048a015260243560248a015260443560448a015260643560648a015260843560848a015260a43560a48a015260c43560c48a015260e43560e48a01526101e06101048a01526101e48901916104f4565b6101248035908801526001600160a01b039094166101448701526101648035908701526101848035908701526101a4803590870152858403600319016101c48701526013190191016104f4565b039260601c5af1801561048a5761045e575b81818080808480f35b67ffffffffffffffff81116104765760405281610455565b634e487b7160e01b82526041600452602482fd5b6040513d84823e3d90fd5b8580fd5b601489900360031b82901b16169350888061036f565b6315b369b360e01b8752600487fd5b8480fd5b5080fd5b9181601f840112156100ff5782359167ffffffffffffffff83116100ff57602083818601950101116100ff57565b908060209392818452848401376000828201840152601f01601f1916010190565b6000546001600160a01b0316330361052957565b60405163118cdaa760e01b8152336004820152602490fdfea264697066735822122010c27808355f38c2d6b4e60c667522ecb8e81db08ed4a706ee4f549497f5e46064736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "limitOrderProtocol";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "owner_";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "IncorrectOrderHash";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }];
        readonly name: "OwnableInvalidOwner";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "OwnableUnauthorizedAccount";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "previousOwner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "OwnershipTransferred";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "LIMIT_ORDER_PROTOCOL_DOMAIN_SEPARATOR";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly name: "hashes";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "owner";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
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
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "extension";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "taker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "remainingMakingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "preInteraction";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "renounceOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bool";
            readonly name: "status";
            readonly type: "bool";
        }];
        readonly name: "setHashOrderStatus";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "transferOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): HashCheckerInterface;
    static connect(address: string, runner?: ContractRunner | null): HashChecker;
}
export {};
//# sourceMappingURL=HashChecker__factory.d.ts.map