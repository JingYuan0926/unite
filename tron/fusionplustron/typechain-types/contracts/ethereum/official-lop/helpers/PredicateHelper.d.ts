import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "../../../../common";
export interface PredicateHelperInterface extends Interface {
    getFunction(nameOrSignature: "and" | "arbitraryStaticCall" | "eq" | "gt" | "lt" | "not" | "or"): FunctionFragment;
    encodeFunctionData(functionFragment: "and", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "arbitraryStaticCall", values: [AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "eq", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "gt", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "lt", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "not", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "or", values: [BigNumberish, BytesLike]): string;
    decodeFunctionResult(functionFragment: "and", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "arbitraryStaticCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "eq", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "gt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "not", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "or", data: BytesLike): Result;
}
export interface PredicateHelper extends BaseContract {
    connect(runner?: ContractRunner | null): PredicateHelper;
    waitForDeployment(): Promise<this>;
    interface: PredicateHelperInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    and: TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    arbitraryStaticCall: TypedContractMethod<[
        target: AddressLike,
        data: BytesLike
    ], [
        bigint
    ], "view">;
    eq: TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    gt: TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    lt: TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    not: TypedContractMethod<[data: BytesLike], [boolean], "view">;
    or: TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "and"): TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "arbitraryStaticCall"): TypedContractMethod<[
        target: AddressLike,
        data: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "eq"): TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "gt"): TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "lt"): TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "not"): TypedContractMethod<[data: BytesLike], [boolean], "view">;
    getFunction(nameOrSignature: "or"): TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    filters: {};
}
//# sourceMappingURL=PredicateHelper.d.ts.map