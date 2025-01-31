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

export interface DataMutasiBank {
    bank: string;
    lokasi: string;
    penerima: string;
    nominal: string;
    norek: string;
    tanggal: Date;
}

export interface StateReminingBalance {
    SaldoBca: number,
    SaldoBri: number,
    SaldoDanamon: number,
    SaldoFreeDanamon: number,
    MutasiCikaret: number,
    MutasiSukahati: number
}

export const initialStateReminingBalance:StateReminingBalance = {
    SaldoFreeDanamon : 0,
    SaldoBca: 0,
    SaldoBri: 0,
    SaldoDanamon: 0,
    MutasiCikaret: 0,
    MutasiSukahati: 0
}

export type ActionReminingBalance = 
| {type: "SET_SALDO_BCA"; payload: number}
| {type: "SET_SALDO_BRI"; payload: number}
| {type: "SET_SALDO_DANAMON"; payload: number}
| {type: "SET_FREE_DANAMON"; payload: number}
| {type: "SET_MUTASI_CIKARET"; payload: number}
| {type: "SET_MUTASI_SUKAHATI"; payload: number}

