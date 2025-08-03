import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { PredicateHelper, PredicateHelperInterface } from "../../../../../contracts/ethereum/official-lop/helpers/PredicateHelper";
type PredicateHelperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class PredicateHelper__factory extends ContractFactory {
    constructor(...args: PredicateHelperConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<PredicateHelper & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): PredicateHelper__factory;
    static readonly bytecode = "0x60808060405234610016576103b5908161001c8239f35b600080fdfe60406080815260048036101561001457600080fd5b600090813560e01c9081634f38e2b8146101ee5781636fe7b0ba146101bc57816374261145146101a0578163bf15fcd814610130578163bf797959146100d657508063bfa75143146100ad5763ca4ece221461006f57600080fd5b346100aa57602061008d8361008336610253565b9093919330610359565b819391936100a0575b5050519015158152f35b1091508380610096565b80fd5b5090346100d2576020906100c96100c336610253565b916102f8565b90519015158152f35b5080fd5b8383346100aa5760203660031901126100aa5782359067ffffffffffffffff82116100aa575061010e60209361011592369101610220565b9030610359565b81929192610127575b50519015158152f35b1591508361011e565b8383346100aa57816003193601126100aa578235906001600160a01b03821682036100aa576024359067ffffffffffffffff82116100aa57509061017a6101809236908601610220565b91610359565b919015610191576020925051908152f35b51631f1b8f6160e01b81529050fd5b8284346100d2576020906100c96101b636610253565b9161029f565b5050346100aa5760206101d28361008336610253565b819391936101e4575050519015158152f35b1491508380610096565b5050346100aa5760206102048361008336610253565b81939193610216575050519015158152f35b1191508380610096565b9181601f8401121561024e5782359167ffffffffffffffff831161024e576020838186019501011161024e57565b600080fd5b90604060031983011261024e57600435916024359067ffffffffffffffff821161024e5761028391600401610220565b9091565b9093929384831161024e57841161024e578101920390565b9290919260005b63ffffffff82169081156102ed5761010e826102c3928888610287565b816102e2575b506102d8579060201c906102a6565b5050915050600190565b6001915014386102c9565b505050915050600090565b9290919260009060005b63ffffffff821690811561034d5761010e8261031f928989610287565b9015908115610341575b50610338579060201c90610302565b50509150915090565b60019150141538610329565b50505050915050600190565b916000906020928294826040519283375afa60203d1416918261037857565b600051915056fea264697066735822122091ecb5f8a83b6845966f3bab9d41d444f12363db237cdfc51c4dadc4cf71d53764736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ArbitraryStaticCallFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "offsets";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "and";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "arbitraryStaticCall";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "eq";
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
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "gt";
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
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "lt";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "not";
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
            readonly name: "offsets";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "or";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): PredicateHelperInterface;
    static connect(address: string, runner?: ContractRunner | null): PredicateHelper;
}
export {};
//# sourceMappingURL=PredicateHelper__factory.d.ts.map