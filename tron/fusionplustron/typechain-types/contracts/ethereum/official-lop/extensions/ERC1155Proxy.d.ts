import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "../../../../common";
export interface ERC1155ProxyInterface extends Interface {
    getFunction(nameOrSignature: "IMMUTABLE_OWNER" | "func_301JL5R"): FunctionFragment;
    encodeFunctionData(functionFragment: "IMMUTABLE_OWNER", values?: undefined): string;
    encodeFunctionData(functionFragment: "func_301JL5R", values: [
        AddressLike,
        AddressLike,
        BigNumberish,
        AddressLike,
        BigNumberish,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "IMMUTABLE_OWNER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "func_301JL5R", data: BytesLike): Result;
}
export interface ERC1155Proxy extends BaseContract {
    connect(runner?: ContractRunner | null): ERC1155Proxy;
    waitForDeployment(): Promise<this>;
    interface: ERC1155ProxyInterface;
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
    func_301JL5R: TypedContractMethod<[
        from: AddressLike,
        to: AddressLike,
        amount: BigNumberish,
        token: AddressLike,
        tokenId: BigNumberish,
        data: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "IMMUTABLE_OWNER"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "func_301JL5R"): TypedContractMethod<[
        from: AddressLike,
        to: AddressLike,
        amount: BigNumberish,
        token: AddressLike,
        tokenId: BigNumberish,
        data: BytesLike
    ], [
        void
    ], "nonpayable">;
    filters: {};
}
//# sourceMappingURL=ERC1155Proxy.d.ts.map