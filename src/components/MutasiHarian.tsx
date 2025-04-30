'use client'
import React from "react";
import CountUp from "./CountUp";
import { initialStateReminingBalance, ValueBank } from "@/types/main";
import { ReducerReminingBalance } from "@/lib/ReducerReminingBalance";
import { DataSnapshot, get, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";
import {calculateTotalsHarian} from "@/lib/CalculateTotals";

export default function MutasiHarian() {
    const [state, dispatch] = React.useReducer(ReducerReminingBalance, initialStateReminingBalance);
    const [isShowCikaret, setIsShowCikaret] = React.useState<boolean>(false);
    const [isShowSukahati, setIsShowSukahati] = React.useState<boolean>(false);
    const [isShowLainLain, setIsShowLainLain] = React.useState<boolean>(false);
    const [totalNotaCikaret, setTotalNotaCikaret] = React.useState<number>(0);
    const [totalSemuaCikaret, setTotalSemuaCikaret] = React.useState<number>(0);
    const [totalNotaSukahati, setTotalNotaSukahati] = React.useState<number>(0);
    const [totalSemuaSukahati, setTotalSemuaSukahati] = React.useState<number>(0);
    const [totalNotaLainLain, setTotalNotaLainLain] = React.useState<number>(0);
    const [totalSemuaLainLain, setTotalSemuaLainLain] = React.useState<number>(0);

    const Tanggal = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
    const Bulan = new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
    const Tahun = new Date().getFullYear();

    const handleOnMutasiCikaret = () => setIsShowCikaret(!isShowCikaret);
    const handleOnMutasiSukahati = () => setIsShowSukahati(!isShowSukahati);
    const handleOnMutasiLainLain = () => setIsShowLainLain(!isShowLainLain);

    
    React.useEffect(() => {
        const refDb = ref(DB, 'Datas/SaldoAwal');
        const refDBFree = ref(DB, 'Datas/SisaFree');
        const refDBMutasi = ref(DB, 'Mutasi');

        const getMutasi = async () => {
            const val = await get(refDBMutasi);
            const dataVal = val.val() || {};
            const { totals } = calculateTotalsHarian(dataVal);
            setTotalNotaCikaret(totals.TotalNotaCikaret);
            setTotalSemuaCikaret(totals.TotalSemuaCikaret); 
            setTotalNotaSukahati(totals.TotalNotaSukahati);
            setTotalSemuaSukahati(totals.TotalSemuaSukahati);  
            setTotalNotaLainLain(totals.TotalNotaLainLain); 
            setTotalSemuaLainLain(totals.TotalSemuaLainLain);   
            return totals;
        };

        const getFree = async () => {
            const val = await get(refDBFree);
            return val.val() ? val.val() : 0;
        };

        const processRealtimeData = async (datas: DataSnapshot) => {
            const DataSaldo: ValueBank = datas.val() || {};
            const freeValue = await getFree();
            const Mutasi = await getMutasi();

            dispatch({ type: "SET_MUTASI_CIKARET", payload: Mutasi.TotalNominalCikaret });
            dispatch({ type: "SET_MUTASI_SUKAHATI", payload: Mutasi.TotalNominalSukahati });
            dispatch({ type: "SET_MUTASI_LAIN_LAIN", payload: Mutasi.TotalNominalLainLain });
            dispatch({ type: "SET_SALDO_BCA", payload: DataSaldo.ValueBca });
            dispatch({ type: "SET_SALDO_BRI", payload: DataSaldo.ValueBri });
            dispatch({ type: "SET_SALDO_DANAMON", payload: DataSaldo.ValueDanamon });
            dispatch({ type: "SET_FREE_DANAMON", payload: parseInt(freeValue.ValueFreeDanamon) });
        };

        const unSubs = onValue(refDb, processRealtimeData, (error) => {
            console.error("Error while fetching data", error);
        });
        return () => unSubs();
    }, []);

    return (
        <div className="flex flex-col items-center pt-6">
            <h1 className="font-bold text-2xl mb-6">Mutasi {Tanggal}/{Bulan}/{Tahun}</h1>
            <div className="w-64 space-y-4">
                {/* Cikaret */}
                <div onClick={handleOnMutasiCikaret} className="cursor-pointer">
                    <h3 className="flex justify-between text-xl">
                        <span className="font-bold">CIKARET</span>
                        <span className="font-bold flex">
                            <span className="mr-2">Rp</span>
                            <CountUp from={0} to={state.MutasiCikaret} separator="," direction="up" duration={0.5} />
                        </span>
                    </h3>
                    {isShowCikaret && (
                        <div className="pl-4">
                            <h3 className="flex justify-between text-l">
                                <span>- TOTAL</span>
                                <span>{totalNotaCikaret} Nota</span>
                            </h3>
                            <h3 className="flex justify-between text-l">
                                <span>- TOTAL UANG</span>
                                <span>Rp {totalSemuaCikaret.toLocaleString('id-ID')}</span>
                            </h3>
                        </div>
                    )}
                </div>

                {/* Sukahati */}
                <div onClick={handleOnMutasiSukahati} className="cursor-pointer">
                    <h3 className="flex justify-between text-xl">
                        <span className="font-bold">SUKAHATI</span>
                        <span className="font-bold flex">
                            <span className="mr-2">Rp</span>
                            <CountUp from={0} to={state.MutasiSukahati} separator="," direction="up" duration={0.5} />
                        </span>
                    </h3>
                    {isShowSukahati && (
                        <div className="pl-4">
                            <h3 className="flex justify-between text-l">
                                <span>- TOTAL</span>
                                <span>{totalNotaSukahati} Nota</span>
                            </h3>
                            <h3 className="flex justify-between text-l">
                                <span>- TOTAL UANG</span>
                                <span>Rp {totalSemuaSukahati.toLocaleString('id-ID')}</span>
                            </h3>
                        </div>
                    )}
                </div>

                {/* Lain Lain */}
                <div onClick={handleOnMutasiLainLain} className="cursor-pointer">
                    <h3 className="flex justify-between text-xl">
                        <span className="font-bold">LAIN LAIN</span>
                        <span className="font-bold flex">
                            <span className="mr-2">Rp</span>
                            <CountUp from={0} to={state.MutasiLainLain} separator="," direction="up" duration={0.5} />
                        </span>
                    </h3>
                    {isShowLainLain && (
                        <div className="pl-4">
                            <h3 className="flex justify-between text-l">
                                <span>- TOTAL</span>
                                <span>{totalNotaLainLain} Nota</span>
                            </h3>
                            <h3 className="flex justify-between text-l">
                                <span>- TOTAL UANG</span>
                                <span>Rp {totalSemuaLainLain.toLocaleString('id-ID')}</span>
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}