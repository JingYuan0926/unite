import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "../../../../common";
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
export interface InteractionMockInterface extends Interface {
    getFunction(nameOrSignature: "copyArg" | "postInteraction" | "preInteraction"): FunctionFragment;
    encodeFunctionData(functionFragment: "copyArg", values: [BigNumberish]): string;
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
    encodeFunctionData(functionFragment: "preInteraction", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        AddressLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "copyArg", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "postInteraction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "preInteraction", data: BytesLike): Result;
}
export interface InteractionMock extends BaseContract {
    connect(runner?: ContractRunner | null): InteractionMock;
    waitForDeployment(): Promise<this>;
    interface: InteractionMockInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    copyArg: TypedContractMethod<[arg: BigNumberish], [bigint], "view">;
    postInteraction: TypedContractMethod<[
        arg0: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        arg4: BigNumberish,
        takingAmount: BigNumberish,
        arg6: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "view">;
    preInteraction: TypedContractMethod<[
        arg0: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        arg4: BigNumberish,
        takingAmount: BigNumberish,
        arg6: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "copyArg"): TypedContractMethod<[arg: BigNumberish], [bigint], "view">;
    getFunction(nameOrSignature: "postInteraction"): TypedContractMethod<[
        arg0: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        arg4: BigNumberish,
        takingAmount: BigNumberish,
        arg6: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "view">;
    getFunction(nameOrSignature: "preInteraction"): TypedContractMethod<[
        arg0: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        arg4: BigNumberish,
        takingAmount: BigNumberish,
        arg6: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "view">;
    filters: {};
}
//# sourceMappingURL=InteractionMock.d.ts.map