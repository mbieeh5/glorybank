'use client'
import React from "react";
import CountUp from "./CountUp";
import { initialStateReminingBalance, ValueBank } from "@/types/main";
import { ReducerReminingBalance } from "@/lib/ReducerReminingBalance";
import { DataSnapshot, get, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";



export default function ReminingBalance() {
    const [state, dispatch] = React.useReducer(ReducerReminingBalance, initialStateReminingBalance);

    React.useEffect(() => {
        const refDb = ref(DB, 'Datas/SaldoAwal');
        const refDBFree = ref(DB, 'Datas/SisaFree')
        const getFree = async () => {
            const val = await get(refDBFree);
            return val.val() ? val.val() : 0;
        }
        const processRealtimeData = async (datas: DataSnapshot) => {
            const DataSaldo: ValueBank = datas.val() || {};
            const freeValue = await getFree();
            dispatch({ type: "SET_SALDO_BCA", payload: DataSaldo.ValueBca });
            dispatch({ type: "SET_SALDO_BRI", payload: DataSaldo.ValueBri });
            dispatch({ type: "SET_SALDO_DANAMON", payload: DataSaldo.ValueDanamon });
            dispatch({ type: "SET_FREE_DANAMON", payload: parseInt(freeValue.ValueFreeDanamon)})
        }

        const unSubs = onValue(refDb, processRealtimeData, (error) => {
            console.error("error while fetching data", error);
        });
        return () => unSubs();
    }, []);

    return (
        <div className="flex flex-col items-center pt-12">
            <h1 className="font-bold text-2xl mb-6">SISA SALDO</h1>
            <div className="w-72">
                <h3 className="flex justify-between text-xl">
                    <span className="font-bold">BCA</span>
                    <span className="font-bold flex">
                        <span className="mr-2">Rp</span> 
                        <CountUp from={0} to={state.SaldoBca} separator="," direction="up" duration={1} className="" />,-
                    </span>
                </h3>
                <h3 className="flex justify-between text-xl">
                    <span className="font-bold">BRI</span>
                    <span className="font-bold flex">
                        <span className="mr-2">Rp</span>
                        <CountUp from={0} to={state.SaldoBri} separator="," direction="up" duration={1} className="" />,-
                    </span>
                </h3>
                <h3 className="flex justify-between text-xl">
                    <span className="font-bold">DANAMON</span>
                    <span className="font-bold flex">
                        <span className="mr-2">Rp</span>
                        <CountUp from={0} to={state.SaldoDanamon} separator="," direction="up" duration={1} className="" />
                    </span>
                </h3>
                <h3 className="flex justify-between text-xl">
                    <span className="font-bold">FREE DANAMON</span>
                    <span className="font-bold flex">
                        <span className="mr-2">@</span>
                        <CountUp from={0} to={state.SaldoFreeDanamon} separator="," direction="up" duration={0.5} className="" />
                    </span>
                </h3>
            </div>
        </div>
    );
}
