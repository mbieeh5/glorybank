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
    ValueBni: number;
    ValueMandiri: number;
    ValueDanamon: number;
    ValueDanamonqr: number;
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
    lokasi: string;
    admin: string;
    tanggal: string;
    status: string;
    nominal: string;
    totalbyr?: string;
    totalByr?: string;
  }
  
export interface DataVal {
    [key: string]: Transaction;
  }

export interface StateReminingBalance {
    SaldoBca: number,
    SaldoBri: number,
    SaldoBni: number,
    SaldoMandiri: number,
    SaldoDanamon: number,
    SaldoDanamonQR: number, 
    SaldoFreeDanamon: number,
    SaldoFreeDanamonQR: number,
    MutasiCikaret: number,
    MutasiLainLain: number,
    MutasiSukahati: number
}

export const initialStateReminingBalance:StateReminingBalance = {
    SaldoFreeDanamon : 0,
    SaldoFreeDanamonQR: 0, 
    SaldoBca: 0,
    SaldoBri: 0,
    SaldoBni: 0,
    SaldoMandiri: 0,
    SaldoDanamon: 0,
    SaldoDanamonQR: 0,
    MutasiCikaret: 0,
    MutasiLainLain: 0,
    MutasiSukahati: 0
}

export type ActionReminingBalance = 
| {type: "SET_SALDO_BCA"; payload: number}
| {type: "SET_SALDO_BRI"; payload: number}
| {type: "SET_SALDO_BNI"; payload: number}
| {type: "SET_SALDO_MANDIRI"; payload: number}
| {type: "SET_SALDO_DANAMON"; payload: number}
| {type: "SET_SALDO_DANAMON_QR"; payload: number}
| {type: "SET_FREE_DANAMON_QR"; payload: number}
| {type: "SET_FREE_DANAMON"; payload: number}
| {type: "SET_MUTASI_CIKARET"; payload: number}
| {type: "SET_MUTASI_LAIN_LAIN"; payload: number}
| {type: "SET_MUTASI_SUKAHATI"; payload: number}

