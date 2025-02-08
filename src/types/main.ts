export interface loginInterface {
    email: string;
    paswd: string;
}

export interface JWTPayload {
    email: string,
    password: string,
    uid: string,
    token: string,
}

export interface NavItemsInterface {
    href: string,
    label: string,
}

export interface ValueBank {
    ValueBca: number;
    ValueBri: number;
    ValueDanamon: number;
}

export interface DropDownTotalanProps {
    totalNota: number;
    totalUang: number;
}

export interface DataMutasiBank {
    id?: string;
    bank: string;
    lokasi: string;
    penerima: string;
    admin?: string;
    nominal: string;
    norek: string;
    tanggal: string;
    status?: string;
}

export interface Transaction {
    tanggal: string;
    status: string;
    nominal: string;
    totalbyr?: string;
    totalByr?: string;
  }
  
export interface BankTransactions {
    [key: string]: Transaction;
  }
  
export interface DataVal {
    [key: string]: BankTransactions;
  }

export interface StateReminingBalance {
    SaldoBca: number,
    SaldoBri: number,
    SaldoDanamon: number,
    SaldoFreeDanamon: number,
    MutasiCikaret: number,
    MutasiLainLain: number,
    MutasiSukahati: number
}

export const initialStateReminingBalance:StateReminingBalance = {
    SaldoFreeDanamon : 0,
    SaldoBca: 0,
    SaldoBri: 0,
    SaldoDanamon: 0,
    MutasiCikaret: 0,
    MutasiLainLain: 0,
    MutasiSukahati: 0
}

export type ActionReminingBalance = 
| {type: "SET_SALDO_BCA"; payload: number}
| {type: "SET_SALDO_BRI"; payload: number}
| {type: "SET_SALDO_DANAMON"; payload: number}
| {type: "SET_FREE_DANAMON"; payload: number}
| {type: "SET_MUTASI_CIKARET"; payload: number}
| {type: "SET_MUTASI_LAIN_LAIN"; payload: number}
| {type: "SET_MUTASI_SUKAHATI"; payload: number}

