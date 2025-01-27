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

export interface StateReminingBalance {
    SaldoBca: number,
    SaldoBri: number,
    SaldoDanamon: number,
}

export const initialStateReminingBalance:StateReminingBalance = {
    SaldoBca: 0,
    SaldoBri: 0,
    SaldoDanamon: 0
}

export type ActionReminingBalance = 
| {type: "SET_SALDO_BCA"; payload: number}
| {type: "SET_SALDO_BRI"; payload: number}
| {type: "SET_SALDO_DANAMON"; payload: number}

