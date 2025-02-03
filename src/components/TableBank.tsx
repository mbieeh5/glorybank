"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DataSnapshot, onValue, ref, runTransaction, update } from "firebase/database";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "@/lib/BankSeparator";
import Swal from "sweetalert2";

export default function TableBank() {
  const [rowData, setRowData] = useState<DataMutasiBank[]>([]);
  const [totalData, setTotalData] = useState<number>(0);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "/");

  const handleUpdateStatus = useCallback(async (record: DataMutasiBank, newStatus: string) => {
    try {
      const sanitizerBank = BankSeparator(record.bank) || "";
      const capitalizeFirstLetter = sanitizerBank.charAt(0).toUpperCase() + sanitizerBank.slice(1).toLowerCase();
      const path = `Mutasi/${record.lokasi}/${sanitizerBank}/${record.id}`;
      const pathPenguranganSaldo = `Datas/SaldoAwal/Value${capitalizeFirstLetter}`;

      await update(ref(DB, path), { status: newStatus });

      if (newStatus === "BATAL") {
        await runTransaction(ref(DB, pathPenguranganSaldo), (currentSaldo) => (currentSaldo || 0) + parseInt(record.nominal.replace(/\./g, ""), 10));
      }

      setRowData((prevData) => prevData.map((item) => (item.id === record.id ? { ...item, status: newStatus } : item)));

      Swal.fire({ icon: "success", title: "Berhasil", text: `Status diubah menjadi ${newStatus}` });
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      Swal.fire({ icon: "error", title: "Gagal", text: "Silakan coba lagi." });
    }
  }, []);

  useEffect(() => {
    const processData = (snapshot: DataSnapshot, lokasi: string): DataMutasiBank[] => {
      const dataVal = snapshot.val() || {};
      const dataList: DataMutasiBank[] = [];
    
      Object.entries(dataVal).forEach(([bank, transactions]) => {
        Object.entries(transactions as DataMutasiBank).forEach(([id, data]) => {
          dataList.push({ ...data, id, lokasi, bank });
        });
      });
    
      return dataList;
    };

    const locations = ["Cikaret", "Sukahati", "LainLain"];
    const listeners: (() => void)[] = [];
  
    locations.forEach((lokasi) => {
      const refDb = ref(DB, `Mutasi/${lokasi}`);
      const listener = onValue(refDb, (snapshot) => {
        const newData = processData(snapshot, lokasi);
        updateData(newData);
      });
      listeners.push(listener);
    });
  
    const updateData = (newData: DataMutasiBank[]) => {
      setRowData((prevData) => {
        const combinedData = [...prevData, ...newData];
        const filteredData = combinedData.filter((item) => {
          const tanggalDB = item.tanggal?.split('@')[0];
          return today === tanggalDB;
        });
  
        setTotalData(filteredData.length);
        return filteredData;
      });
    };
  
    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
    };
    
  }, [today]);

  return (
    <div className="p-3 w-full">
      <h2 className="text-lg font-bold mb-4">TRF HARI INI: {totalData} Nota</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">TANGGAL</th>
              <th className="py-2 px-4 border-b">LOKASI</th>
              <th className="py-2 px-4 border-b">BANK</th>
              <th className="py-2 px-4 border-b">NOREK</th>
              <th className="py-2 px-4 border-b">NOMINAL</th>
              <th className="py-2 px-4 border-b">PENERIMA</th>
              <th className="py-2 px-4 border-b">ADMIN</th>
              <th className="py-2 px-4 border-b">STATUS</th>
              <th className="py-2 px-4 border-b">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {rowData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{row.tanggal}</td>
                <td className="py-2 px-4 border-b">{row.lokasi}</td>
                <td className="py-2 px-4 border-b">{row.bank}</td>
                <td className="py-2 px-4 border-b">{row.norek}</td>
                <td className="py-2 px-4 border-b">{row.nominal}</td>
                <td className="py-2 px-4 border-b">{row.penerima}</td>
                <td className="py-2 px-4 border-b">{row.admin}</td>
                <td className="py-2 px-4 border-b">{row.status || "PENDING"}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex space-x-2">
                    <ActionButton label="Sukses" color="blue" onClick={() => handleUpdateStatus(row, "SUKSES")} />
                    <ActionButton label="Batal" color="red" onClick={() => handleUpdateStatus(row, "BATAL")} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ActionButton = ({ label, color, onClick }: { label: string; color: string; onClick: () => void }) => (
  <button className={`px-4 py-2 bg-${color}-500 text-white rounded hover:bg-${color}-600 transition`} onClick={onClick}>
    {label}
  </button>
);
