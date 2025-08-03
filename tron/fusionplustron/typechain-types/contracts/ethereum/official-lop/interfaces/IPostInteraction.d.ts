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
export interface IPostInteractionInterface extends Interface {
    getFunction(nameOrSignature: "postInteraction"): FunctionFragment;
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
    decodeFunctionResult(functionFragment: "postInteraction", data: BytesLike): Result;
}
export interface IPostInteraction extends BaseContract {
    connect(runner?: ContractRunner | null): IPostInteraction;
    waitForDeployment(): Promise<this>;
    interface: IPostInteractionInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    postInteraction: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        extension: BytesLike,
        orderHash: BytesLike,
        taker: AddressLike,
        makingAmount: BigNumberish,
        takingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "postInteraction"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        extension: BytesLike,
        orderHash: BytesLike,
        taker: AddressLike,
        makingAmount: BigNumberish,
        takingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish,
        extraData: BytesLike
    ], [
        void
    ], "nonpayable">;
    filters: {};
}
//# sourceMappingURL=IPostInteraction.d.ts.map