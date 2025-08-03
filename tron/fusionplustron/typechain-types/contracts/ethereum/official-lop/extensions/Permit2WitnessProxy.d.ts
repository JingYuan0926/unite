import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "../../../../common";
export declare namespace IPermit2WitnessTransferFrom {
    type TokenPermissionsStruct = {
        token: AddressLike;
        amount: BigNumberish;
    };
    type TokenPermissionsStructOutput = [token: string, amount: bigint] & {
        token: string;
        amount: bigint;
    };
    type PermitTransferFromStruct = {
        permitted: IPermit2WitnessTransferFrom.TokenPermissionsStruct;
        nonce: BigNumberish;
        deadline: BigNumberish;
    };
    type PermitTransferFromStructOutput = [
        permitted: IPermit2WitnessTransferFrom.TokenPermissionsStructOutput,
        nonce: bigint,
        deadline: bigint
    ] & {
        permitted: IPermit2WitnessTransferFrom.TokenPermissionsStructOutput;
        nonce: bigint;
        deadline: bigint;
    };
}
export interface Permit2WitnessProxyInterface extends Interface {
    getFunction(nameOrSignature: "IMMUTABLE_OWNER" | "func_801zDya"): FunctionFragment;
    encodeFunctionData(functionFragment: "IMMUTABLE_OWNER", values?: undefined): string;
    encodeFunctionData(functionFragment: "func_801zDya", values: [
        AddressLike,
        AddressLike,
        BigNumberish,
        IPermit2WitnessTransferFrom.PermitTransferFromStruct,
        BytesLike,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "IMMUTABLE_OWNER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "func_801zDya", data: BytesLike): Result;
}
export interface Permit2WitnessProxy extends BaseContract {
    connect(runner?: ContractRunner | null): Permit2WitnessProxy;
    waitForDeployment(): Promise<this>;
    interface: Permit2WitnessProxyInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    IMMUTABLE_OWNER: TypedContractMethod<[], [string], "view">;
    func_801zDya: TypedContractMethod<[
        from: AddressLike,
        to: AddressLike,
        amount: BigNumberish,
        permit: IPermit2WitnessTransferFrom.PermitTransferFromStruct,
        witness: BytesLike,
        sig: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "IMMUTABLE_OWNER"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "func_801zDya"): TypedContractMethod<[
        from: AddressLike,
        to: AddressLike,
        amount: BigNumberish,
        permit: IPermit2WitnessTransferFrom.PermitTransferFromStruct,
        witness: BytesLike,
        sig: BytesLike
    ], [
        void
    ], "nonpayable">;
    filters: {};
}
//# sourceMappingURL=Permit2WitnessProxy.d.ts.map