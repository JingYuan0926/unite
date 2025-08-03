import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../common";
export declare namespace TronFusionExtension {
    type TronSwapDataStruct = {
        tronRecipient: string;
        tronFactory: string;
        expectedTrxAmount: BigNumberish;
        secretHash: BytesLike;
        timelock: BigNumberish;
        tronChainId: BigNumberish;
        isActive: boolean;
    };
    type TronSwapDataStructOutput = [
        tronRecipient: string,
        tronFactory: string,
        expectedTrxAmount: bigint,
        secretHash: string,
        timelock: bigint,
        tronChainId: bigint,
        isActive: boolean
    ] & {
        tronRecipient: string;
        tronFactory: string;
        expectedTrxAmount: bigint;
        secretHash: string;
        timelock: bigint;
        tronChainId: bigint;
        isActive: boolean;
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
export interface TronFusionExtensionInterface extends Interface {
    getFunction(nameOrSignature: "ESCROW_FACTORY" | "LIMIT_ORDER_PROTOCOL" | "MAX_TIMELOCK" | "MIN_TIMELOCK" | "TRX_REPRESENTATION" | "deactivateSwap" | "getExpectedTrxAmount" | "getSrcEscrowAddress" | "getTronRecipient" | "getTronSwapData" | "hasActiveTronSwap" | "orderSwapData" | "orderToSrcEscrow" | "owner" | "postInteraction" | "renounceOwnership" | "rescueERC20" | "rescueETH" | "transferOwnership"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "EthEscrowCreated" | "OwnershipTransferred" | "TronEscrowRequested" | "TronSwapInitiated"): EventFragment;
    encodeFunctionData(functionFragment: "ESCROW_FACTORY", values?: undefined): string;
    encodeFunctionData(functionFragment: "LIMIT_ORDER_PROTOCOL", values?: undefined): string;
    encodeFunctionData(functionFragment: "MAX_TIMELOCK", values?: undefined): string;
    encodeFunctionData(functionFragment: "MIN_TIMELOCK", values?: undefined): string;
    encodeFunctionData(functionFragment: "TRX_REPRESENTATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "deactivateSwap", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getExpectedTrxAmount", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getSrcEscrowAddress", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getTronRecipient", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getTronSwapData", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "hasActiveTronSwap", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "orderSwapData", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "orderToSrcEscrow", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "postInteraction", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        AddressLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "rescueERC20", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "rescueETH", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferOwnership", values: [AddressLike]): string;
    decodeFunctionResult(functionFragment: "ESCROW_FACTORY", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "LIMIT_ORDER_PROTOCOL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MAX_TIMELOCK", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MIN_TIMELOCK", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "TRX_REPRESENTATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deactivateSwap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getExpectedTrxAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSrcEscrowAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTronRecipient", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTronSwapData", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "hasActiveTronSwap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "orderSwapData", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "orderToSrcEscrow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "postInteraction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rescueERC20", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rescueETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;
}
export declare namespace EthEscrowCreatedEvent {
    type InputTuple = [
        orderHash: BytesLike,
        escrowAddress: AddressLike,
        secretHash: BytesLike,
        amount: BigNumberish,
        safetyDeposit: BigNumberish
    ];
    type OutputTuple = [
        orderHash: string,
        escrowAddress: string,
        secretHash: string,
        amount: bigint,
        safetyDeposit: bigint
    ];
    interface OutputObject {
        orderHash: string;
        escrowAddress: string;
        secretHash: string;
        amount: bigint;
        safetyDeposit: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
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
export declare namespace TronEscrowRequestedEvent {
    type InputTuple = [
        orderHash: BytesLike,
        tronFactory: string,
        secretHash: BytesLike,
        trxAmount: BigNumberish
    ];
    type OutputTuple = [
        orderHash: string,
        tronFactory: string,
        secretHash: string,
        trxAmount: bigint
    ];
    interface OutputObject {
        orderHash: string;
        tronFactory: string;
        secretHash: string;
        trxAmount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace TronSwapInitiatedEvent {
    type InputTuple = [
        orderHash: BytesLike,
        maker: AddressLike,
        taker: AddressLike,
        ethAmount: BigNumberish,
        trxAmount: BigNumberish,
        secretHash: BytesLike,
        tronRecipient: string,
        srcEscrowAddress: AddressLike
    ];
    type OutputTuple = [
        orderHash: string,
        maker: string,
        taker: string,
        ethAmount: bigint,
        trxAmount: bigint,
        secretHash: string,
        tronRecipient: string,
        srcEscrowAddress: string
    ];
    interface OutputObject {
        orderHash: string;
        maker: string;
        taker: string;
        ethAmount: bigint;
        trxAmount: bigint;
        secretHash: string;
        tronRecipient: string;
        srcEscrowAddress: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface TronFusionExtension extends BaseContract {
    connect(runner?: ContractRunner | null): TronFusionExtension;
    waitForDeployment(): Promise<this>;
    interface: TronFusionExtensionInterface;
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
    LIMIT_ORDER_PROTOCOL: TypedContractMethod<[], [string], "view">;
    MAX_TIMELOCK: TypedContractMethod<[], [bigint], "view">;
    MIN_TIMELOCK: TypedContractMethod<[], [bigint], "view">;
    TRX_REPRESENTATION: TypedContractMethod<[], [string], "view">;
    deactivateSwap: TypedContractMethod<[
        orderHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    getExpectedTrxAmount: TypedContractMethod<[
        orderHash: BytesLike
    ], [
        bigint
    ], "view">;
    getSrcEscrowAddress: TypedContractMethod<[
        orderHash: BytesLike
    ], [
        string
    ], "view">;
    getTronRecipient: TypedContractMethod<[
        orderHash: BytesLike
    ], [
        string
    ], "view">;
    getTronSwapData: TypedContractMethod<[
        orderHash: BytesLike
    ], [
        TronFusionExtension.TronSwapDataStructOutput
    ], "view">;
    hasActiveTronSwap: TypedContractMethod<[
        orderHash: BytesLike
    ], [
        boolean
    ], "view">;
    orderSwapData: TypedContractMethod<[
        arg0: BytesLike
    ], [
        [
            string,
            string,
            bigint,
            string,
            bigint,
            bigint,
            boolean
        ] & {
            tronRecipient: string;
            tronFactory: string;
            expectedTrxAmount: bigint;
            secretHash: string;
            timelock: bigint;
            tronChainId: bigint;
            isActive: boolean;
        }
    ], "view">;
    orderToSrcEscrow: TypedContractMethod<[arg0: BytesLike], [string], "view">;
    owner: TypedContractMethod<[], [string], "view">;
    postInteraction: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        orderHash: BytesLike,
        taker: AddressLike,
        makingAmount: BigNumberish,
        arg5: BigNumberish,
        arg6: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "nonpayable">;
    renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;
    rescueERC20: TypedContractMethod<[
        token: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    rescueETH: TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    transferOwnership: TypedContractMethod<[
        newOwner: AddressLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "ESCROW_FACTORY"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "LIMIT_ORDER_PROTOCOL"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "MAX_TIMELOCK"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "MIN_TIMELOCK"): TypedContractMethod<[], [bigint], "view">;
    getFunction(nameOrSignature: "TRX_REPRESENTATION"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "deactivateSwap"): TypedContractMethod<[orderHash: BytesLike], [void], "nonpayable">;
    getFunction(nameOrSignature: "getExpectedTrxAmount"): TypedContractMethod<[orderHash: BytesLike], [bigint], "view">;
    getFunction(nameOrSignature: "getSrcEscrowAddress"): TypedContractMethod<[orderHash: BytesLike], [string], "view">;
    getFunction(nameOrSignature: "getTronRecipient"): TypedContractMethod<[orderHash: BytesLike], [string], "view">;
    getFunction(nameOrSignature: "getTronSwapData"): TypedContractMethod<[
        orderHash: BytesLike
    ], [
        TronFusionExtension.TronSwapDataStructOutput
    ], "view">;
    getFunction(nameOrSignature: "hasActiveTronSwap"): TypedContractMethod<[orderHash: BytesLike], [boolean], "view">;
    getFunction(nameOrSignature: "orderSwapData"): TypedContractMethod<[
        arg0: BytesLike
    ], [
        [
            string,
            string,
            bigint,
            string,
            bigint,
            bigint,
            boolean
        ] & {
            tronRecipient: string;
            tronFactory: string;
            expectedTrxAmount: bigint;
            secretHash: string;
            timelock: bigint;
            tronChainId: bigint;
            isActive: boolean;
        }
    ], "view">;
    getFunction(nameOrSignature: "orderToSrcEscrow"): TypedContractMethod<[arg0: BytesLike], [string], "view">;
    getFunction(nameOrSignature: "owner"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "postInteraction"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        orderHash: BytesLike,
        taker: AddressLike,
        makingAmount: BigNumberish,
        arg5: BigNumberish,
        arg6: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "renounceOwnership"): TypedContractMethod<[], [void], "nonpayable">;
    getFunction(nameOrSignature: "rescueERC20"): TypedContractMethod<[
        token: AddressLike,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "rescueETH"): TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "transferOwnership"): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
    getEvent(key: "EthEscrowCreated"): TypedContractEvent<EthEscrowCreatedEvent.InputTuple, EthEscrowCreatedEvent.OutputTuple, EthEscrowCreatedEvent.OutputObject>;
    getEvent(key: "OwnershipTransferred"): TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
    getEvent(key: "TronEscrowRequested"): TypedContractEvent<TronEscrowRequestedEvent.InputTuple, TronEscrowRequestedEvent.OutputTuple, TronEscrowRequestedEvent.OutputObject>;
    getEvent(key: "TronSwapInitiated"): TypedContractEvent<TronSwapInitiatedEvent.InputTuple, TronSwapInitiatedEvent.OutputTuple, TronSwapInitiatedEvent.OutputObject>;
    filters: {
        "EthEscrowCreated(bytes32,address,bytes32,uint256,uint256)": TypedContractEvent<EthEscrowCreatedEvent.InputTuple, EthEscrowCreatedEvent.OutputTuple, EthEscrowCreatedEvent.OutputObject>;
        EthEscrowCreated: TypedContractEvent<EthEscrowCreatedEvent.InputTuple, EthEscrowCreatedEvent.OutputTuple, EthEscrowCreatedEvent.OutputObject>;
        "OwnershipTransferred(address,address)": TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        OwnershipTransferred: TypedContractEvent<OwnershipTransferredEvent.InputTuple, OwnershipTransferredEvent.OutputTuple, OwnershipTransferredEvent.OutputObject>;
        "TronEscrowRequested(bytes32,string,bytes32,uint256)": TypedContractEvent<TronEscrowRequestedEvent.InputTuple, TronEscrowRequestedEvent.OutputTuple, TronEscrowRequestedEvent.OutputObject>;
        TronEscrowRequested: TypedContractEvent<TronEscrowRequestedEvent.InputTuple, TronEscrowRequestedEvent.OutputTuple, TronEscrowRequestedEvent.OutputObject>;
        "TronSwapInitiated(bytes32,address,address,uint256,uint256,bytes32,string,address)": TypedContractEvent<TronSwapInitiatedEvent.InputTuple, TronSwapInitiatedEvent.OutputTuple, TronSwapInitiatedEvent.OutputObject>;
        TronSwapInitiated: TypedContractEvent<TronSwapInitiatedEvent.InputTuple, TronSwapInitiatedEvent.OutputTuple, TronSwapInitiatedEvent.OutputObject>;
    };
}
//# sourceMappingURL=TronFusionExtension.d.ts.map