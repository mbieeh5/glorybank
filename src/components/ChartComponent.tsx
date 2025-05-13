'use client'
import React from "react";
import CountUp from "./CountUp";
import { initialStateReminingBalance } from "@/types/main";
import { ReducerReminingBalance } from "@/lib/ReducerReminingBalance";
import { DataSnapshot, get, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";
import { calculateTotalsGlobal } from "@/lib/CalculateTotals";

export default function ChartComponent() {
    const [state, dispatch] = React.useReducer(ReducerReminingBalance, initialStateReminingBalance);
    const [totalNotaCikaret] = React.useState<number>(0);
    const [totalSemuaCikaret] = React.useState<number>(0);
    const [totalAdminCikaret] = React.useState<number>(0);
    const [totalNotaSukahati] = React.useState<number>(0);
    const [totalSemuaSukahati] = React.useState<number>(0);
    const [totalAdminSukahati] = React.useState<number>(0);
    const [totalCuan, setTotalCuan] = React.useState<number>(0);
    const [cuanPercentage, setCuanPercentage] = React.useState<number>(5);

    
    React.useEffect(() => {
        const calculateCuan = (percentage: number) => {
            const cuan = (totalAdminCikaret + totalAdminSukahati) * (percentage / 100);
            setTotalCuan(cuan);
        };
        calculateCuan(cuanPercentage);
        
    }, [totalAdminCikaret, totalAdminSukahati, cuanPercentage]);

    const perhitunganCuan = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const value = e.target.value;

        if (value.includes('.') || value.includes('e')) return;

        const percentage = parseInt(value, 10) || 0;
        setCuanPercentage(percentage);
    };

    React.useEffect(() => {
        const refDb = ref(DB, 'Datas/SaldoAwal');
        const refDbMutasiCikaret = ref(DB, 'Mutasi/');

        const getMutasi = async () => {
            const val = await get(refDbMutasiCikaret);
            const dataVal = val.val() || {};
            const { totals } = calculateTotalsGlobal(dataVal);
            return totals;
        };
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const processRealtimeData = async (datas: DataSnapshot) => {
            const Mutasi = await getMutasi();

            dispatch({ type: "SET_MUTASI_CIKARET", payload: Mutasi.TotalNominalCikaret });
            dispatch({ type: "SET_MUTASI_SUKAHATI", payload: Mutasi.TotalNominalSukahati });
        };

        const unSubs = onValue(refDb, processRealtimeData, (error) => {
            console.error("Error while fetching data", error);
        });
        return () => unSubs();
    }, []);

    return (
        <div className="flex flex-col items-center pt-6">
            <h1 className="font-bold text-2xl mb-6">Totalan Data</h1>
            <div className="w-64 space-y-4">

                {/* Cikaret */}
                <div className="cursor-pointer">
                    <h3 className="flex justify-between text-xl">
                        <span className="font-bold">CIKARET</span>
                        <span className="font-bold flex">
                            <span className="mr-2">Rp</span>
                            <CountUp from={0} to={state.MutasiCikaret} separator="," direction="up" duration={0.5} />
                        </span>
                    </h3>
                    <div className="pl-4">
                        <h3 className="flex justify-between text-l">
                            <span>- TOTAL</span>
                            <span>{totalNotaCikaret} Nota</span>
                        </h3>
                        <h3 className="flex justify-between text-l">
                            <span>- ADMIN</span>
                            <span>Rp {totalAdminCikaret.toLocaleString('id-ID')}</span>
                        </h3>
                        <h3 className="flex justify-between text-l">
                            <span>- TOTAL UANG</span>
                            <span>Rp {totalSemuaCikaret.toLocaleString('id-ID')}</span>
                        </h3>
                    </div>
                </div>

                {/* Sukahati */}
                <div className="cursor-pointer">
                    <h3 className="flex justify-between text-xl">
                        <span className="font-bold">SUKAHATI</span>
                        <span className="font-bold flex">
                            <span className="mr-2">Rp</span>
                            <CountUp from={0} to={state.MutasiSukahati} separator="," direction="up" duration={0.5} />
                        </span>
                    </h3>
                    <div className="pl-4">
                        <h3 className="flex justify-between text-l">
                            <span>- TOTAL</span>
                            <span>{totalNotaSukahati} Nota</span>
                        </h3>
                        <h3 className="flex justify-between text-l">
                            <span>- ADMIN</span>
                            <span>Rp {totalAdminSukahati.toLocaleString('id-ID')}</span>
                        </h3>
                        <h3 className="flex justify-between text-l">
                            <span>- TOTAL UANG</span>
                            <span>Rp {totalSemuaSukahati.toLocaleString('id-ID')}</span>
                        </h3>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h1 className="font-bold text-2xl mt-6">
                    Total Admin Global : Rp {(totalAdminCikaret + totalAdminSukahati).toLocaleString('id-ID')}
                </h1>
            </div>
            <h1 className="font-bold text-xl mt-6 mb-6">Total Cuan: Rp {totalCuan.toLocaleString('id-ID')}</h1>
            <input
                type="number"
                placeholder="5%"
                value={cuanPercentage}
                onChange={perhitunganCuan}
                min="0"
                max="100"
            />
        </div>
    );
}