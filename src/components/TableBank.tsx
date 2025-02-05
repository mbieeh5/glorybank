"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DataSnapshot, onValue, ref, runTransaction, update } from "firebase/database";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "@/lib/BankSeparator";
import Swal from "sweetalert2";
import { MaterialReactTable } from "material-react-table";
import { Button } from "@mui/material";

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
      console.log(dataVal);
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
          const tanggalDB = item.tanggal?.split("@")[0];
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

  const columns = [
    { accessorKey: "tanggal", header: "TANGGAL" },
    { accessorKey: "lokasi", header: "LOKASI" },
    { accessorKey: "bank", header: "BANK" },
    { accessorKey: "norek", header: "NOREK" },
    { accessorKey: "nominal", header: "NOMINAL" },
    { accessorKey: "penerima", header: "PENERIMA" },
    { accessorKey: "admin", header: "ADMIN" },
    { accessorKey: "status", header: "STATUS", Cell: ({ row }: { row: { original: DataMutasiBank } }) => row.original.status || "PENDING" },
    {
      accessorKey: "aksi",
      header: "AKSI",
      Cell: ({ row }:{ row: { original: DataMutasiBank } }) => (
        <div style={{ display: "flex", gap: "5px" }}>
          <Button variant="contained" color="primary" onClick={() => handleUpdateStatus(row.original, "SUKSES")}>
            Sukses
          </Button>
          <Button variant="contained" color="error" onClick={() => handleUpdateStatus(row.original, "BATAL")}>
            Batal
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem", fontWeight: "bold" }}>TRF HARI INI: {totalData} Nota</h2>
      <MaterialReactTable
        enablePagination={false}
      columns={columns} data={rowData} />
    </div>
  );
}
