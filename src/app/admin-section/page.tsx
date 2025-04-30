"use client"
import React from "react";
import TambahSaldo from "./component/TambahSaldo";
import PindahSaldo from "./component/PindahSaldo";

export default function AdminSection() {
    const [action, setAction] = React.useState("tambahSaldo");
    const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAction(e.target.value);
    }
    return(
        <div className="pt-12 bg-gray-100">
            <div className="flex items-center justify-center">
            <label className="mr-4 flex items-center cursor-pointer">
                <input 
                type="radio" 
                name="action" 
                value="tambahSaldo" 
                onChange={handleActionChange} 
                defaultChecked 
                className="mr-2 accent-blue-500"
                />
                <span className="text-lg font-medium text-gray-700">TAMBAH SALDO</span>
            </label>
            <label className="ml-4 flex items-center cursor-pointer">
                <input 
                type="radio" 
                name="action" 
                value="pindahSaldo" 
                onChange={handleActionChange} 
                className="mr-2 accent-blue-500"
                />
                <span className="text-lg font-medium text-gray-700">PINDAH SALDO</span>
            </label>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
            {action === "tambahSaldo" && <TambahSaldo />}
            {action === "pindahSaldo" && <PindahSaldo />}
            </div>
            <div className="mt-4 text-center text-gray-500 text-sm">
                (MUTASI PENAMBAHAN DAN PEMINDAHAN SALDO AKAN TERCATAT DI HALAMAN INI)
            </div>
        </div>
    )
}