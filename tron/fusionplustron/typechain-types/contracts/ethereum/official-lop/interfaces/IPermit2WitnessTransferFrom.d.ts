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
    type SignatureTransferDetailsStruct = {
        to: AddressLike;
        requestedAmount: BigNumberish;
    };
    type SignatureTransferDetailsStructOutput = [
        to: string,
        requestedAmount: bigint
    ] & {
        to: string;
        requestedAmount: bigint;
    };
}
export interface IPermit2WitnessTransferFromInterface extends Interface {
    getFunction(nameOrSignature: "permitWitnessTransferFrom"): FunctionFragment;
    encodeFunctionData(functionFragment: "permitWitnessTransferFrom", values: [
        IPermit2WitnessTransferFrom.PermitTransferFromStruct,
        IPermit2WitnessTransferFrom.SignatureTransferDetailsStruct,
        AddressLike,
        BytesLike,
        string,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "permitWitnessTransferFrom", data: BytesLike): Result;
}
export interface IPermit2WitnessTransferFrom extends BaseContract {
    connect(runner?: ContractRunner | null): IPermit2WitnessTransferFrom;
    waitForDeployment(): Promise<this>;
    interface: IPermit2WitnessTransferFromInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    permitWitnessTransferFrom: TypedContractMethod<[
        permit: IPermit2WitnessTransferFrom.PermitTransferFromStruct,
        transferDetails: IPermit2WitnessTransferFrom.SignatureTransferDetailsStruct,
        owner: AddressLike,
        witness: BytesLike,
        witnessTypeString: string,
        signature: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "permitWitnessTransferFrom"): TypedContractMethod<[
        permit: IPermit2WitnessTransferFrom.PermitTransferFromStruct,
        transferDetails: IPermit2WitnessTransferFrom.SignatureTransferDetailsStruct,
        owner: AddressLike,
        witness: BytesLike,
        witnessTypeString: string,
        signature: BytesLike
    ], [
        void
    ], "nonpayable">;
    filters: {};
}
//# sourceMappingURL=IPermit2WitnessTransferFrom.d.ts.map