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
export interface DemoResolverV2Interface extends Interface {
    getFunction(nameOrSignature: "ESCROW_FACTORY" | "LOP" | "createDstEscrow" | "executeAtomicSwap" | "executeSimpleSwap" | "getLockedBalance" | "recoverETH" | "withdrawETH"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "EscrowCreated" | "SwapExecuted"): EventFragment;
    encodeFunctionData(functionFragment: "ESCROW_FACTORY", values?: undefined): string;
    encodeFunctionData(functionFragment: "LOP", values?: undefined): string;
    encodeFunctionData(functionFragment: "createDstEscrow", values: [IBaseEscrow.ImmutablesStruct, BigNumberish]): string;
    encodeFunctionData(functionFragment: "executeAtomicSwap", values: [
        IBaseEscrow.ImmutablesStruct,
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "executeSimpleSwap", values: [BytesLike, BigNumberish, BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "getLockedBalance", values?: undefined): string;
    encodeFunctionData(functionFragment: "recoverETH", values?: undefined): string;
    encodeFunctionData(functionFragment: "withdrawETH", values: [BigNumberish, AddressLike]): string;
    decodeFunctionResult(functionFragment: "ESCROW_FACTORY", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "LOP", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createDstEscrow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeAtomicSwap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "executeSimpleSwap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getLockedBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "recoverETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawETH", data: BytesLike): Result;
}
export declare namespace EscrowCreatedEvent {
    type InputTuple = [escrow: AddressLike, orderHash: BytesLike];
    type OutputTuple = [escrow: string, orderHash: string];
    interface OutputObject {
        escrow: string;
        orderHash: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace SwapExecutedEvent {
    type InputTuple = [
        maker: AddressLike,
        escrow: AddressLike,
        orderHash: BytesLike,
        amount: BigNumberish,
        safetyDeposit: BigNumberish
    ];
    type OutputTuple = [
        maker: string,
        escrow: string,
        orderHash: string,
        amount: bigint,
        safetyDeposit: bigint
    ];
    interface OutputObject {
        maker: string;
        escrow: string;
        orderHash: string;
        amount: bigint;
        safetyDeposit: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface DemoResolverV2 extends BaseContract {
    connect(runner?: ContractRunner | null): DemoResolverV2;
    waitForDeployment(): Promise<this>;
    interface: DemoResolverV2Interface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    ESCROW_FACTORY: TypedContractMethod<[], [string], "view">;
    LOP: TypedContractMethod<[], [string], "view">;
    createDstEscrow: TypedContractMethod<[
        dstImmutables: IBaseEscrow.ImmutablesStruct,
        srcCancellationTimestamp: BigNumberish
    ], [
        void
    ], "payable">;
    executeAtomicSwap: TypedContractMethod<[
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
    executeSimpleSwap: TypedContractMethod<[
        orderHash: BytesLike,
        amount: BigNumberish,
        safetyDeposit: BigNumberish,
        maker: AddressLike
    ], [
        void
    ], "payable">;
    getLockedBalance: TypedContractMethod<[], [bigint], "view">;
    recoverETH: TypedContractMethod<[], [void], "nonpayable">;
    withdrawETH: TypedContractMethod<[
        amount: BigNumberish,
        recipient: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "ESCROW_FACTORY"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "LOP"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "createDstEscrow"): TypedContractMethod<[
        dstImmutables: IBaseEscrow.ImmutablesStruct,
        srcCancellationTimestamp: BigNumberish
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "executeAtomicSwap"): TypedContractMethod<[
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
    getFunction(nameOrSignature: "executeSimpleSwap"): TypedContractMethod<[
        orderHash: BytesLike,
        amount: BigNumberish,
        safetyDeposit: BigNumberish,
        maker: AddressLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "getLockedBalance"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "recoverETH"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "withdrawETH"): TypedContractMethod<[
        amount: BigNumberish,
        recipient: AddressLike
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "EscrowCreated"): TypedContractEvent<EscrowCreatedEvent.InputTuple, EscrowCreatedEvent.OutputTuple, EscrowCreatedEvent.OutputObject>;
    getEvent(key: "SwapExecuted"): TypedContractEvent<SwapExecutedEvent.InputTuple, SwapExecutedEvent.OutputTuple, SwapExecutedEvent.OutputObject>;
    filters: {
        "EscrowCreated(address,bytes32)": TypedContractEvent<EscrowCreatedEvent.InputTuple, EscrowCreatedEvent.OutputTuple, EscrowCreatedEvent.OutputObject>;
        EscrowCreated: TypedContractEvent<EscrowCreatedEvent.InputTuple, EscrowCreatedEvent.OutputTuple, EscrowCreatedEvent.OutputObject>;
        "SwapExecuted(address,address,bytes32,uint256,uint256)": TypedContractEvent<SwapExecutedEvent.InputTuple, SwapExecutedEvent.OutputTuple, SwapExecutedEvent.OutputObject>;
        SwapExecuted: TypedContractEvent<SwapExecutedEvent.InputTuple, SwapExecutedEvent.OutputTuple, SwapExecutedEvent.OutputObject>;
    };
}
//# sourceMappingURL=DemoResolverV2.d.ts.map