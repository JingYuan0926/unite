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

    contract(): {
      at(address: string): Promise<any>;
    };

    isAddress(address: string): boolean;
    toSun(trxAmount: string): string;
    fromSun(sunAmount: string): string;
  }

  export = TronWeb;
}
