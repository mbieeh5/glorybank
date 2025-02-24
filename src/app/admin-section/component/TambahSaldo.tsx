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
        const pathHistory = `History/PenambahanSaldo/${bank}/`
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Tambah Saldo</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <label>
            BANK:
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="form-select mt-1 block w-full"
              required
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="BRI">BRI</option>
              <option value="BNI">BNI</option>
              <option value="MANDIRI">MANDIRI</option>
              <option value="DANAMON">DANAMON</option>
            </select>
          </label>
          <label>
            Penambahan:
            <input
              type="text"
              value={penambahan}
              onChange={handlePenambahanChange}
              className="form-input mt-1 block w-full"
              required
            />
          </label>
          <label>
            Keterangan:
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="form-input mt-1 block w-full"
              required
            />
          </label>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tambah Saldo
          </button>
        </form>
      </div>
    </div>
  );
}
