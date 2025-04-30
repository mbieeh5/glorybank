"use client";
import { runTransaction, ref, push, get } from "firebase/database";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { auth, DB } from "../../../../firebase-config";
import { BankSeparator } from "@/lib/BankSeparator";

export default function PindahSaldo() {
  const [bankA, setBankA] = useState("");
  const [bankB, setBankB] = useState("");
  const [penambahan, setPenambahan] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");

  const handlePenambahanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = new Intl.NumberFormat("id-ID").format(Number(value));
    setPenambahan(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    Swal.fire({
      title: "Konfirmasi Pemindahan Saldo",
      text: `Pemindahan saldo dari bank ${bankA} ke bank ${bankB}, sebesar ${penambahan}, ${keterangan}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire("Berhasil", "Penambahan saldo berhasil", "success");
        const SaldoTambah = parseInt(penambahan.replace(/\./g, ''), 10);
        const sanitizerBankA = BankSeparator(bankA) || "";
        const sanitizerBankB = BankSeparator(bankB) || "";
        const capitalizeFirstLetterA = sanitizerBankA.charAt(0).toUpperCase() + sanitizerBankA.slice(1).toLowerCase();
        const capitalizeFirstLetterB = sanitizerBankB.charAt(0).toUpperCase() + sanitizerBankB.slice(1).toLowerCase();

        const pathSaldoA = `Datas/SaldoAwal/Value${capitalizeFirstLetterA}`;
        const pathSaldoB = `Datas/SaldoAwal/Value${capitalizeFirstLetterB}`;
        const pathHistory = `History/PenambahanSaldo`;
        const pathMutasi = `Mutasi`;
        const akun = auth.currentUser?.email || 'null';
        const FreeBankDanamon = (await get(ref(DB, `Datas/SisaFree/ValueFree${capitalizeFirstLetterA}`))).val() || 0;
        const adminBank = sanitizerBankA !== "DANAMON" && sanitizerBankA !== "DANAMONQR" ? true : FreeBankDanamon < 1 ? true : false;
        const DataToPushHistory = {
            SaldoTambah,
            bank: bankB,
            akun,
            tanggal: new Date().toISOString(),
            keterangan,
        }

        const DataToPushMutasi = {
            nominal: SaldoTambah + (adminBank ? 2500 : 0),
            lokasi: 'LainLain',
            admin: adminBank ? 2500 : 0,
            bank: bankA,
            akun,
            tanggal: new Date().toISOString(),
            nama : keterangan,
        }
        
        console.log({DataToPushHistory, DataToPushMutasi, pathSaldoA, pathSaldoB, FreeBankDanamon, adminBank})
        // PENGURANGAN FREE BANK DANAMON
        if(sanitizerBankA === "DANAMON" || sanitizerBankA === "DANAMONQR"){
            await runTransaction(ref(DB, `Datas/SisaFree/ValueFree${capitalizeFirstLetterA}`), (currentFree) => (currentFree || 0) - 1);
        }

        // PENGURANGAN SALDO BANK A
        await runTransaction(ref(DB, pathSaldoA), (currentSaldo) => (currentSaldo || 0) - (SaldoTambah + (adminBank ? 2500 : 0)));
        
        // PENAMBAHAN SALDO BANK B
        await runTransaction(ref(DB, pathSaldoB), (currentSaldo) => (currentSaldo || 0) + SaldoTambah);
        
        //PUSH DATA KE HISTORY PENAMBAHAN SALDO
        await push(ref(DB, pathHistory), DataToPushHistory)

        //PUSH DATA KE MUTASI
        await push(ref(DB, pathMutasi), DataToPushMutasi)
        
      }
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">PINDAH SALDO</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Dari:
            </label>
            <select
              value={bankA}
              onChange={(e) => setBankA(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="BRI">BRI</option>
              <option value="BNI">BNI</option>
              <option value="MANDIRI">MANDIRI</option>
              <option value="DANAMON">DANAMON</option>
              <option value="DANAMON QR">DANAMON QR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Ke:
            </label>
            <select
              value={bankB}
              onChange={(e) => setBankB(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="BRI">BRI</option>
              <option value="BNI">BNI</option>
              <option value="MANDIRI">MANDIRI</option>
              <option value="DANAMON">DANAMON</option>
              <option value="DANAMON QR">DANAMON QR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Penambahan:
            </label>
            <input
              type="text"
              value={penambahan}
              onChange={handlePenambahanChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Keterangan:
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            PINDAHKAN SALDO
          </button>
        </form>
      </div>
    </div>
  );
}
