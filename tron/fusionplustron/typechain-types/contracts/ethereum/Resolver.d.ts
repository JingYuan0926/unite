import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../common";
export declare namespace IBaseEscrow {
    type ImmutablesStruct = {
        orderHash: BytesLike;
        hashlock: BytesLike;
        maker: BigNumberish;
        taker: BigNumberish;
        token: BigNumberish;
        amount: BigNumberish;
        safetyDeposit: BigNumberish;
        timelocks: BigNumberish;
    };
    type ImmutablesStructOutput = [
        orderHash: string,
        hashlock: string,
        maker: bigint,
        taker: bigint,
        token: bigint,
        amount: bigint,
        safetyDeposit: bigint,
        timelocks: bigint
    ] & {
        orderHash: string;
        hashlock: string;
        maker: bigint;
        taker: bigint;
        token: bigint;
        amount: bigint;
        safetyDeposit: bigint;
        timelocks: bigint;
    };
}
export declare namespace IOrderMixin {
    type OrderStruct = {
        salt: BigNumberish;
        maker: BigNumberish;
        receiver: BigNumberish;
        makerAsset: BigNumberish;
        takerAsset: BigNumberish;
        makingAmount: BigNumberish;
        takingAmount: BigNumberish;
        makerTraits: BigNumberish;
    };
    type OrderStructOutput = [
        salt: bigint,
        maker: bigint,
        receiver: bigint,
        makerAsset: bigint,
        takerAsset: bigint,
        makingAmount: bigint,
        takingAmount: bigint,
        makerTraits: bigint
    ] & {
        salt: bigint;
        maker: bigint;
        receiver: bigint;
        makerAsset: bigint;
        takerAsset: bigint;
        makingAmount: bigint;
        takingAmount: bigint;
        makerTraits: bigint;
    };
}
export interface ResolverInterface extends Interface {
    getFunction(nameOrSignature: "arbitraryCalls" | "cancel" | "deployDst" | "deploySrc" | "owner" | "renounceOwnership" | "transferOwnership" | "withdraw"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
    encodeFunctionData(functionFragment: "arbitraryCalls", values: [AddressLike[], BytesLike[]]): string;
    encodeFunctionData(functionFragment: "cancel", values: [AddressLike, IBaseEscrow.ImmutablesStruct]): string;
    encodeFunctionData(functionFragment: "deployDst", values: [IBaseEscrow.ImmutablesStruct, BigNumberish]): string;
    encodeFunctionData(functionFragment: "deploySrc", values: [
        IBaseEscrow.ImmutablesStruct,
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [AddressLike, BytesLike, IBaseEscrow.ImmutablesStruct]): string;
    decodeFunctionResult(functionFragment: "arbitraryCalls", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cancel", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deployDst", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deploySrc", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
}
export declare namespace OwnershipTransferredEvent {
    type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
    type OutputTuple = [previousOwner: string, newOwner: string];
    interface OutputObject {
        previousOwner: string;
        newOwner: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface Resolver extends BaseContract {
    connect(runner?: ContractRunner | null): Resolver;
    waitForDeployment(): Promise<this>;
    interface: ResolverInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    arbitraryCalls: TypedContractMethod<[
        targets: AddressLike[],
        arguments: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    cancel: TypedContractMethod<[
        escrow: AddressLike,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    deployDst: TypedContractMethod<[
        dstImmutables: IBaseEscrow.ImmutablesStruct,
        srcCancellationTimestamp: BigNumberish
    ], [
        void
    ], "payable">;
    deploySrc: TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct,
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish,
        args: BytesLike
    ], [
        void
    ], "payable">;
    owner: TypedContractMethod<[], [string], "view">;
    renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;
    transferOwnership: TypedContractMethod<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    withdraw: TypedContractMethod<[
        escrow: AddressLike,
        secret: BytesLike,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "arbitraryCalls"): TypedContractMethod<[
        targets: AddressLike[],
        arguments: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "cancel"): TypedContractMethod<[
        escrow: AddressLike,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "deployDst"): TypedContractMethod<[
        dstImmutables: IBaseEscrow.ImmutablesStruct,
        srcCancellationTimestamp: BigNumberish
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "deploySrc"): TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct,
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish,
        args: BytesLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "withdraw"): TypedContractMethod<[
        escrow: AddressLike,
        secret: BytesLike,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    filters: {
        "OwnershipTransferred(address,address)": TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        OwnershipTransferred: TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    };
}
//# sourceMappingURL=Resolver.d.ts.map