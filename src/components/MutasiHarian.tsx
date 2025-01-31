'use client'
import React from "react";
import CountUp from "./CountUp";
import { initialStateReminingBalance, ValueBank } from "@/types/main";
import { ReducerReminingBalance } from "@/lib/ReducerReminingBalance";
import { DataSnapshot, get, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";



export default function MutasiHarian() {
    const [state, dispatch] = React.useReducer(ReducerReminingBalance, initialStateReminingBalance);
    const Tanggal = new Date().getDate();
    const Bulan = new Date().getMonth()+1 < 10 ? `0${new Date().getMonth()+1}` : new Date().getMonth();
    const Tahun = new Date().getFullYear();

    React.useEffect(() => {
        const refDb = ref(DB, 'Datas/SaldoAwal');
        const refDBFree = ref(DB, 'Datas/SisaFree')
        const refDbMutasiCikaret = ref(DB, 'Mutasi/Cikaret');
        const refDbMutasiSukahati = ref(DB, 'Mutasi/Sukahati');

        const getMutasiCikaret = async () => {
            const val = await get(refDbMutasiCikaret);
            const dataVal = val.val() || {};
            let totalNominal:number = 0
            for (const bank in dataVal){
                const transactions = dataVal[bank];
                if(dataVal.hasOwnProperty(bank)){

                    for(const key in transactions) {
                        if(transactions.hasOwnProperty(key)){
                            const transaction = transactions[key];
                            const isDateNow = transaction.tanggal.split("@")[0]
                            if(transaction.nominal && `${Tanggal}/${Bulan}/${Tahun}` === isDateNow){
                                totalNominal += parseInt(transaction.nominal.replace(/\./g, ''), 10);
                            }
                        }
                    }
                }
            }
            return totalNominal
        }

        const getMutasiSukahati = async () => {
            const val = await get(refDbMutasiSukahati);
            const dataVal = val.val() || {};
            let totalNominal:number = 0
            for (const bank in dataVal){
                const transactions = dataVal[bank];
                if(dataVal.hasOwnProperty(bank)){

                    for(const key in transactions) {
                        if(transactions.hasOwnProperty(key)){
                            const transaction = transactions[key];
                            const isDateNow = transaction.tanggal.split("@")[0]
                            if(transaction.nominal && `${Tanggal}/${Bulan}/${Tahun}` === isDateNow){
                                totalNominal += parseInt(transaction.nominal.replace(/\./g, ''), 10);
                            }
                        }
                    }
                }
            }
            return totalNominal
        }

        const getFree = async () => {
            const val = await get(refDBFree);
            return val.val() ? val.val() : 0;
        }

        const processRealtimeData = async (datas: DataSnapshot) => {
            const DataSaldo: ValueBank = datas.val() || {};
            const freeValue = await getFree();
            const MutasiCikaret = await getMutasiCikaret()
            const MutasiSukahati = await getMutasiSukahati()

            dispatch({ type: "SET_MUTASI_CIKARET", payload: MutasiCikaret });
            dispatch({ type: "SET_MUTASI_SUKAHATI", payload: MutasiSukahati });
            dispatch({ type: "SET_SALDO_BCA", payload: DataSaldo.ValueBca });
            dispatch({ type: "SET_SALDO_BRI", payload: DataSaldo.ValueBri });
            dispatch({ type: "SET_SALDO_DANAMON", payload: DataSaldo.ValueDanamon });
            dispatch({ type: "SET_FREE_DANAMON", payload: parseInt(freeValue.ValueFreeDanamon)})
        }

        const unSubs = onValue(refDb, processRealtimeData, (error) => {
            console.error("error while fetching data", error);
        });
        return () => unSubs();
    }, [Tanggal, Bulan, Tahun]);

    return (
        <div className="flex flex-col items-center pt-6">
            <h1 className="font-bold text-2xl mb-6">Mutasi {Tanggal}/{Bulan}/{Tahun}</h1>
            <div className="w-64">
                <h3 className="flex justify-between text-xl">
                    <span className="font-bold">CIKARET</span>
                    <span className="font-bold flex">
                        <span className="mr-2">Rp</span> 
                        <CountUp from={0} to={state.MutasiCikaret} separator="," direction="up" duration={0.5} className="" />
                    </span>
                </h3>
                <h3 className="flex justify-between text-xl">
                    <span className="font-bold">SUKAHATI</span>
                    <span className="font-bold flex">
                        <span className="mr-2">Rp</span>
                        <CountUp from={0} to={state.MutasiSukahati} separator="," direction="up" duration={0.5} className="" />
                    </span>
                </h3>
            </div>
        </div>
    );
}
