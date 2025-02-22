import { ActionReminingBalance, StateReminingBalance } from "@/types/main";


export function ReducerReminingBalance(state: StateReminingBalance, action: ActionReminingBalance): StateReminingBalance{
    switch (action.type) {
        case "SET_SALDO_BCA":
            return {...state, SaldoBca: action.payload};
        case "SET_SALDO_BRI":
            return {...state, SaldoBri: action.payload};
        case "SET_SALDO_DANAMON":
            return {...state, SaldoDanamon: action.payload};
        case "SET_SALDO_BNI":
            return {...state, SaldoBni: action.payload};
        case "SET_SALDO_MANDIRI":
            return {...state, SaldoMandiri: action.payload};
        case "SET_FREE_DANAMON":
            return {...state, SaldoFreeDanamon: action.payload};
        case "SET_MUTASI_LAIN_LAIN":
            return {...state, MutasiLainLain: action.payload};
        case "SET_MUTASI_CIKARET":
            return {...state, MutasiCikaret: action.payload};
        case "SET_MUTASI_SUKAHATI":
            return {...state, MutasiSukahati: action.payload}
        default:
            return state;
    }
}