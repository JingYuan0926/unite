import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { ImmutableOwner, ImmutableOwnerInterface } from "../../../../../contracts/ethereum/official-lop/extensions/ImmutableOwner";
type ImmutableOwnerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ImmutableOwner__factory extends ContractFactory {
    constructor(...args: ImmutableOwnerConstructorParams);
    getDeployTransaction(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ImmutableOwner & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): ImmutableOwner__factory;
    static readonly bytecode = "0x60a03461006857601f61012538819003918201601f19168301916001600160401b0383118484101761006d5780849260209460405283398101031261006857516001600160a01b03811681036100685760805260405160a1908161008482396080518160380152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe6080806040526004361015601257600080fd5b600090813560e01c63f3d1372f14602857600080fd5b34606757816003193601126067577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b5080fdfea26469706673582212207f7d4c6d06ea5242ae527391dc4ece69be835b1580ad1f827af0901cfb76415564736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_immutableOwner";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "IOAccessDenied";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IMMUTABLE_OWNER";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ImmutableOwnerInterface;
    static connect(address: string, runner?: ContractRunner | null): ImmutableOwner;
}
export {};
//# sourceMappingURL=ImmutableOwner__factory.d.ts.map