'use client'
import React from "react";
import CountUp from "./CountUp";
import { initialStateReminingBalance, ValueBank } from "@/types/main";
import { ReducerReminingBalance } from "@/lib/ReducerReminingBalance";
import { DataSnapshot, get, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";
import CardComponentBalance from "./CardBalance";



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
            dispatch({ type: "SET_SALDO_BNI", payload: DataSaldo.ValueBni });
            dispatch({ type: "SET_SALDO_MANDIRI", payload: DataSaldo.ValueMandiri });
            dispatch({ type: "SET_SALDO_DANAMON", payload: DataSaldo.ValueDanamon });
            dispatch({ type: "SET_SALDO_DANAMON_QR", payload: DataSaldo.ValueDanamonqr})
            dispatch({ type: "SET_FREE_DANAMON", payload: parseInt(freeValue.ValueFreeDanamon)})
            dispatch({ type: "SET_FREE_DANAMON_QR", payload: parseInt(freeValue.ValueFreeDanamonqr)})
        }

        const unSubs = onValue(refDb, processRealtimeData, (error) => {
            console.error("error while fetching data", error);
        });
        return () => unSubs();
    }, []);

    return (
        <div className="flex flex-col items-center pt-6">
                <CardComponentBalance>
                    <h1 className="font-bold text-3xl mb-8 text-center text-gray-800">SISA SALDO</h1>
                    <div className="space-y-1 w-full">
                        <div className="flex justify-between items-center text-lg bg-gray-100 p-2 rounded-lg shadow-sm">
                            <span className="font-semibold text-gray-700">BCA (∞)</span>
                            <span className="font-bold text-gray-900 flex items-center">
                                <span className="mr-2 text-gray-500">Rp</span>
                                <CountUp from={0} to={state.SaldoBca} separator="," direction="up" duration={0.5} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg bg-gray-100 p-2 rounded-lg shadow-sm">
                            <span className="font-semibold text-gray-700">BNI (∞)</span>
                            <span className="font-bold text-gray-900 flex items-center">
                                <span className="mr-2 text-gray-500">Rp</span>
                                <CountUp from={0} to={state.SaldoBni} separator="," direction="up" duration={0.5} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg bg-gray-100 p-2 rounded-lg shadow-sm">
                            <span className="font-semibold text-gray-700">BRI (∞)</span>
                            <span className="font-bold text-gray-900 flex items-center">
                                <span className="mr-2 text-gray-500">Rp</span>
                                <CountUp from={0} to={state.SaldoBri} separator="," direction="up" duration={0.5} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg bg-gray-100 p-2 rounded-lg shadow-sm">
                            <span className="font-semibold text-gray-700">
                                DANAMON (<CountUp from={0} to={state.SaldoFreeDanamon} separator="," direction="up" duration={0.5} />)
                            </span>
                            <span className="font-bold text-gray-900 flex items-center">
                                <span className="mr-2 text-gray-500">Rp</span>
                                <CountUp from={0} to={state.SaldoDanamon} separator="," direction="up" duration={0.5} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg bg-gray-100 p-2 rounded-lg shadow-sm">
                            <span className="font-semibold text-gray-700">
                                DANAMON QR (<CountUp from={0} to={state.SaldoFreeDanamonQR} separator="," direction="up" duration={0.5} />)
                            </span>
                            <span className="font-bold text-gray-900 flex items-center">
                                <span className="mr-2 text-gray-500">Rp</span>
                                <CountUp from={0} to={state.SaldoDanamonQR} separator="," direction="up" duration={0.5} />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-lg bg-gray-100 p-2 rounded-lg shadow-sm">
                            <span className="font-semibold text-gray-700">MANDIRI (∞)</span>
                            <span className="font-bold text-gray-900 flex items-center">
                                <span className="mr-2 text-gray-500">Rp</span>
                                <CountUp from={0} to={state.SaldoMandiri} separator="," direction="up" duration={0.5} />
                            </span>
                        </div>
                    </div>
                </CardComponentBalance>
        </div>
    );
}
