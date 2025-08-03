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
export interface EscrowZkSyncInterface extends Interface {
    getFunction(nameOrSignature: "FACTORY" | "RESCUE_DELAY" | "cancel" | "rescueFunds" | "withdraw"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "EscrowCancelled" | "EscrowWithdrawal" | "FundsRescued"): EventFragment;
    encodeFunctionData(functionFragment: "FACTORY", values?: undefined): string;
    encodeFunctionData(functionFragment: "RESCUE_DELAY", values?: undefined): string;
    encodeFunctionData(functionFragment: "cancel", values: [IBaseEscrow.ImmutablesStruct]): string;
    encodeFunctionData(functionFragment: "rescueFunds", values: [AddressLike, BigNumberish, IBaseEscrow.ImmutablesStruct]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [BytesLike, IBaseEscrow.ImmutablesStruct]): string;
    decodeFunctionResult(functionFragment: "FACTORY", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "RESCUE_DELAY", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cancel", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rescueFunds", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
}
export declare namespace EscrowCancelledEvent {
    type InputTuple = [];
    type OutputTuple = [];
    interface OutputObject {
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace EscrowWithdrawalEvent {
    type InputTuple = [secret: BytesLike];
    type OutputTuple = [secret: string];
    interface OutputObject {
        secret: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace FundsRescuedEvent {
    type InputTuple = [token: AddressLike, amount: BigNumberish];
    type OutputTuple = [token: string, amount: bigint];
    interface OutputObject {
        token: string;
        amount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface EscrowZkSync extends BaseContract {
    connect(runner?: ContractRunner | null): EscrowZkSync;
    waitForDeployment(): Promise<this>;
    interface: EscrowZkSyncInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    FACTORY: TypedContractMethod<[], [string], "view">;
    RESCUE_DELAY: TypedContractMethod<[], [bigint], "view">;
    cancel: TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    rescueFunds: TypedContractMethod<[
        token: AddressLike,
        amount: BigNumberish,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    withdraw: TypedContractMethod<[
        secret: BytesLike,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "FACTORY"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "RESCUE_DELAY"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "cancel"): TypedContractMethod<[
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "rescueFunds"): TypedContractMethod<[
        token: AddressLike,
        amount: BigNumberish,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "withdraw"): TypedContractMethod<[
        secret: BytesLike,
        immutables: IBaseEscrow.ImmutablesStruct
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "EscrowCancelled"): TypedContractEvent<EscrowCancelledEvent.InputTuple, EscrowCancelledEvent.OutputTuple, EscrowCancelledEvent.OutputObject>;
    getEvent(key: "EscrowWithdrawal"): TypedContractEvent<EscrowWithdrawalEvent.InputTuple, EscrowWithdrawalEvent.OutputTuple, EscrowWithdrawalEvent.OutputObject>;
    getEvent(key: "FundsRescued"): TypedContractEvent<FundsRescuedEvent.InputTuple, FundsRescuedEvent.OutputTuple, FundsRescuedEvent.OutputObject>;
    filters: {
        "EscrowCancelled()": TypedContractEvent<EscrowCancelledEvent.InputTuple, EscrowCancelledEvent.OutputTuple, EscrowCancelledEvent.OutputObject>;
        EscrowCancelled: TypedContractEvent<EscrowCancelledEvent.InputTuple, EscrowCancelledEvent.OutputTuple, EscrowCancelledEvent.OutputObject>;
        "EscrowWithdrawal(bytes32)": TypedContractEvent<EscrowWithdrawalEvent.InputTuple, EscrowWithdrawalEvent.OutputTuple, EscrowWithdrawalEvent.OutputObject>;
        EscrowWithdrawal: TypedContractEvent<EscrowWithdrawalEvent.InputTuple, EscrowWithdrawalEvent.OutputTuple, EscrowWithdrawalEvent.OutputObject>;
        "FundsRescued(address,uint256)": TypedContractEvent<FundsRescuedEvent.InputTuple, FundsRescuedEvent.OutputTuple, FundsRescuedEvent.OutputObject>;
        FundsRescued: TypedContractEvent<FundsRescuedEvent.InputTuple, FundsRescuedEvent.OutputTuple, FundsRescuedEvent.OutputObject>;
    };
}
//# sourceMappingURL=EscrowZkSync.d.ts.map