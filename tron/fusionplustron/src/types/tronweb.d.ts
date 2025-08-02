// Type declarations for TronWeb
declare module "tronweb" {
  interface TronWebConfig {
    fullHost: string;
    privateKey?: string;
  }

  interface TronWebUtils {
    crypto: {
      randomBytes(size: number): Uint8Array;
      keccak256(data: Uint8Array): Uint8Array;
    };
    bytes: {
      byteArray2hexStr(bytes: Uint8Array): string;
    };
    abi: {
      encodeParamsV2ByABI(funAbi: any, args: any[]): string;
    };
  }

  interface TronWebTrx {
    getCurrentBlock(): Promise<any>;
    getBalance(address: string): Promise<number>;
    getTransactionInfo(txHash: string): Promise<any>;
  }

  class TronWeb {
    constructor(config: TronWebConfig);

    utils: TronWebUtils;
    trx: TronWebTrx;
    address: {
      toHex(address: string): string;
      fromHex(hexAddress: string): string;
    };

    contract(
      abi?: any,
      address?: string
    ):
      | {
          at(address: string): Promise<any>;
        }
      | Promise<any>;

    isAddress(address: string): boolean;
    toSun(trxAmount: string): string;
    fromSun(sunAmount: string): string;
    sha3(data: string): string;
    toHex(data: any): string;
  }

  export = TronWeb;
}
