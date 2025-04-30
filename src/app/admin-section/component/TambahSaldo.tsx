"use client";
import { runTransaction, ref, push } from "firebase/database";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { auth, DB } from "../../../../firebase-config";
import { BankSeparator } from "@/lib/BankSeparator";

export default function TambahSaldo() {
  const [bank, setBank] = useState("");
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
      title: "Konfirmasi Penambahan Saldo",
      text: `Penambahan saldo ke bank ${bank}, sebesar ${penambahan}, ${keterangan}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire("Berhasil", "Penambahan saldo berhasil", "success");
        const SaldoTambah = parseInt(penambahan.replace(/\./g, ''), 10);
        const sanitizerBank = BankSeparator(bank) || "";
        const capitalizeFirstLetter = sanitizerBank.charAt(0).toUpperCase() + sanitizerBank.slice(1).toLowerCase();
        const pathSaldo = `Datas/SaldoAwal/Value${capitalizeFirstLetter}`;
        const pathHistory = `History/PenambahanSaldo/`
        const akun = auth.currentUser?.email || 'null';
        const DataToPush = {
            SaldoTambah,
            bank,
            akun,
            tanggal: new Date().toISOString(),
            keterangan,
        }
        await push(ref(DB, pathHistory), DataToPush)
        await runTransaction(ref(DB, pathSaldo), (currentSaldo) => (currentSaldo || 0) + SaldoTambah);
        
      }
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">TAMBAH SALDO</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          BANK:
        </label>
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Pilih Bank</option>
          <option value="BCA">BCA</option>
          <option value="BRI">BRI</option>
          <option value="BNI">BNI</option>
          <option value="MANDIRI">MANDIRI</option>
          <option value="DANAMON">DANAMON</option>
          <option value="DANAMONQR">DANAMON QR</option>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        </div>
        <button
        type="submit"
        className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
        TAMBAHKAN SALDO
        </button>
      </form>
      </div>
    </div>
  );
}
