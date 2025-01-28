import { ActionReminingBalance, StateReminingBalance } from "@/types/main";


export function ReducerReminingBalance(state: StateReminingBalance, action: ActionReminingBalance): StateReminingBalance{
    switch (action.type) {
        case "SET_SALDO_BCA":
            return {...state, SaldoBca: action.payload};
        case "SET_SALDO_BRI":
            return {...state, SaldoBri: action.payload};
        case "SET_SALDO_DANAMON":
            return {...state, SaldoDanamon: action.payload};
        case "SET_FREE_DANAMON":
            return {...state, SaldoFreeDanamon: action.payload};
        default:
            return state;
    }
}