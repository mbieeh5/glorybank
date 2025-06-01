"use client"
import useGetDataBank from "@/hooks/getDataBank";
import { convertDataBank } from "@/lib/DataBankConverter";
import React from "react";

export default function DataTransfer() {

    const { rowData } = useGetDataBank();
    const { rawCountedData } = convertDataBank(rowData);
    const ArrayData = Object.entries(rawCountedData);
    return (
        <>
        <div className="flex flex-col gap-4">
            {ArrayData.map(([bank, data]) => {
                const TotalSemua = data.Cikaret.TotalAdmin + data.Sukahati.TotalAdmin;
                const TotalNota = data.Cikaret.Nota + data.Sukahati.Nota;
                return (
                <div key={bank} className="flex flex-col gap-2 bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold">{bank}</h2>
                    <p className="text-gray-600">Nota Cikaret: {data.Cikaret.Nota}</p>
                    <p className="text-gray-600">Admin Cikaret: {data.Cikaret.TotalAdmin.toLocaleString()}</p>
                    <p className="text-gray-600">Nota Sukahati: {data.Sukahati.Nota}</p>
                    <p className="text-gray-600">Admin Sukahati: {data.Sukahati.TotalAdmin.toLocaleString()}</p>   
                    <p className="text-gray-600">--- TOTAL NOTA: {TotalNota.toLocaleString()}</p>   
                    <p className="text-gray-600">--- TOTAL ADMIN: {TotalSemua.toLocaleString()}</p>   
                </div>
                )
                })}
        </div>
        </>
    );
}

