import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../../common";
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
export declare namespace IEscrowFactory {
    type DstImmutablesComplementStruct = {
        maker: BigNumberish;
        amount: BigNumberish;
        token: BigNumberish;
        safetyDeposit: BigNumberish;
        chainId: BigNumberish;
    };
    type DstImmutablesComplementStructOutput = [
        maker: bigint,
        amount: bigint,
        token: bigint,
        safetyDeposit: bigint,
        chainId: bigint
    ] & {
        maker: bigint;
        amount: bigint;
        token: bigint;
        safetyDeposit: bigint;
        chainId: bigint;
    };
}
export interface IEscrowFactoryInterface extends Interface {
    getFunction(nameOrSignature: "ESCROW_DST_IMPLEMENTATION" | "ESCROW_SRC_IMPLEMENTATION" | "addressOfEscrowDst" | "addressOfEscrowSrc" | "createDstEscrow"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "DstEscrowCreated" | "SrcEscrowCreated"): EventFragment;
    encodeFunctionData(functionFragment: "ESCROW_DST_IMPLEMENTATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "ESCROW_SRC_IMPLEMENTATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "addressOfEscrowDst", values: [IBaseEscrow.ImmutablesStruct]): string;
    encodeFunctionData(functionFragment: "addressOfEscrowSrc", values: [IBaseEscrow.ImmutablesStruct]): string;
    encodeFunctionData(functionFragment: "createDstEscrow", values: [IBaseEscrow.ImmutablesStruct, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "ESCROW_DST_IMPLEMENTATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ESCROW_SRC_IMPLEMENTATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addressOfEscrowDst", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addressOfEscrowSrc", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createDstEscrow", data: BytesLike): Result;
}
export declare namespace DstEscrowCreatedEvent {
    type InputTuple = [
        escrow: AddressLike,
        hashlock: BytesLike,
        taker: BigNumberish
    ];
    type OutputTuple = [escrow: string, hashlock: string, taker: bigint];
    interface OutputObject {
        escrow: string;
        hashlock: string;
        taker: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace SrcEscrowCreatedEvent {
    type InputTuple = [
        srcImmutables: IBaseEscrow.ImmutablesStruct,
        dstImmutablesComplement: IEscrowFactory.DstImmutablesComplementStruct
    ];
    type OutputTuple = [
        srcImmutables: IBaseEscrow.ImmutablesStructOutput,
        dstImmutablesComplement: IEscrowFactory.DstImmutablesComplementStructOutput
    ];
    interface OutputObject {
        srcImmutables: IBaseEscrow.ImmutablesStructOutput;
        dstImmutablesComplement: IEscrowFactory.DstImmutablesComplementStructOutput;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IEscrowFactory extends BaseContract {
    connect(runner?: ContractRunner | null): IEscrowFactory;
    waitForDeployment(): Promise<this>;
    interface: IEscrowFactoryInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    ESCROW_DST_IMPLEMENTATION: TypedContractMethod<[], [string], "view">;
    ESCROW_SRC_IMPLEMENTATION: TypedContractMethod<[], [string], "view">;
    addressOfEscrowDst: TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        string
    ], "view">;
    addressOfEscrowSrc: TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        string
    ], "view">;
    createDstEscrow: TypedContractMethod<[
        dstImmutables: IBaseEscrow.ImmutablesStruct,
        srcCancellationTimestamp: BigNumberish
    ], [
        void
    ], "payable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "ESCROW_DST_IMPLEMENTATION"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "ESCROW_SRC_IMPLEMENTATION"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "addressOfEscrowDst"): TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "addressOfEscrowSrc"): TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "createDstEscrow"): TypedContractMethod<[
        dstImmutables: IBaseEscrow.ImmutablesStruct,
        srcCancellationTimestamp: BigNumberish
    ], [
        void
    ], "payable">;
    getEvent(key: "DstEscrowCreated"): TypedContractEvent<DstEscrowCreatedEvent.InputTuple, DstEscrowCreatedEvent.OutputTuple, DstEscrowCreatedEvent.OutputObject>;
    getEvent(key: "SrcEscrowCreated"): TypedContractEvent<SrcEscrowCreatedEvent.InputTuple, SrcEscrowCreatedEvent.OutputTuple, SrcEscrowCreatedEvent.OutputObject>;
    filters: {
        "DstEscrowCreated(address,bytes32,uint256)": TypedContractEvent<DstEscrowCreatedEvent.InputTuple, DstEscrowCreatedEvent.OutputTuple, DstEscrowCreatedEvent.OutputObject>;
        DstEscrowCreated: TypedContractEvent<DstEscrowCreatedEvent.InputTuple, DstEscrowCreatedEvent.OutputTuple, DstEscrowCreatedEvent.OutputObject>;
        "SrcEscrowCreated(tuple,tuple)": TypedContractEvent<SrcEscrowCreatedEvent.InputTuple, SrcEscrowCreatedEvent.OutputTuple, SrcEscrowCreatedEvent.OutputObject>;
        SrcEscrowCreated: TypedContractEvent<SrcEscrowCreatedEvent.InputTuple, SrcEscrowCreatedEvent.OutputTuple, SrcEscrowCreatedEvent.OutputObject>;
    };
}
//# sourceMappingURL=IEscrowFactory.d.ts.map