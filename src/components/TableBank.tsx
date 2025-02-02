"use client";
import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { onValue, ref, runTransaction, update } from "firebase/database";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "@/lib/BankSeparator";
import Swal from "sweetalert2";
import { ClientSideRowModelModule, ColDef } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function TableBank() {
  const [rowData, setRowData] = useState<DataMutasiBank[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalData, setTotalData] = useState<number>(0);

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/');

  const handleUpdateStatus = async (record: DataMutasiBank, newStatus: string) => {
    try {
      const sanitizerBank = BankSeparator(record.bank) || "";
      const capitalizeFirstLetter = sanitizerBank.charAt(0).toUpperCase() + sanitizerBank.slice(1).toLowerCase();
      const path = `Mutasi/${record.lokasi}/${sanitizerBank}/${record.id}`;
      const pathPenguranganSaldo = `Datas/SaldoAwal/Value${capitalizeFirstLetter}`;
      const updates = { status: newStatus };
      await update(ref(DB, path), updates);

      if (newStatus === "BATAL") {
        await runTransaction(ref(DB, pathPenguranganSaldo), (currentSaldo) => {
          const updatedSaldo = (currentSaldo || 0) + parseInt(record.nominal.replace(/\./g, ''), 10);
          return updatedSaldo;
        });
      }

      setRowData((prevData) =>
        prevData.map((item) =>
          item.id === record.id ? { ...item, status: newStatus } : item
        )
      );
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: `Status berhasil diubah menjadi ${newStatus}`,
      });
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengubah status. Silakan coba lagi.',
      });
    }
  };

  const columnDefs: ColDef<any>[] = useMemo(() => [
    { headerName: "TANGGAL", field: "tanggal" as keyof DataMutasiBank },
    { headerName: "LOKASI", field: "lokasi" as keyof DataMutasiBank },
    { headerName: "BANK", field: "bank" as keyof DataMutasiBank },
    { headerName: "NOREK", field: "norek" as keyof DataMutasiBank },
    { headerName: "NOMINAL", field: "nominal" as keyof DataMutasiBank },
    { headerName: "PENERIMA", field: "penerima" as keyof DataMutasiBank },
    { headerName: "ADMIN", field: "admin" as keyof DataMutasiBank },
    {
      headerName: "STATUS",
      field: "status" as keyof DataMutasiBank,
      cellRenderer: (params: any) => params.value || 'PENDING'
    },
    {
      headerName: "AKSI",
      field: 'button',
      cellRendererFramework: (params: any) => (
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => handleUpdateStatus(params.data, 'SUKSES')}
          >
            Sukses
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => handleUpdateStatus(params.data, 'BATAL')}
          >
            Batal
          </button>
        </div>
      )
    }
  ], [rowData]);

  useEffect(() => {
    const refDbCikaret = ref(DB, 'Mutasi/Cikaret');
    const refDbSukahati = ref(DB, 'Mutasi/Sukahati');
    const refDbLainLain = ref(DB, 'Mutasi/LainLain');
    setIsLoading(true);

    const processData = (snapshot: any): DataMutasiBank[] => {
      const dataVal = snapshot.val() || {};
      const dataList: DataMutasiBank[] = [];

      for (const bank in dataVal) {
        if (dataVal.hasOwnProperty(bank)) {
          const transactions = dataVal[bank];
          for (const key in transactions) {
            if (transactions.hasOwnProperty(key)) {
              dataList.push({ ...transactions[key], id: key });
            }
          }
        }
      }
      setIsLoading(false);
      return dataList;
    };

    const cikaretListener = onValue(refDbCikaret, (snapshot) => {
      const dataCikaret = processData(snapshot);
      updateData(dataCikaret);
    });

    const sukahatiListener = onValue(refDbSukahati, (snapshot) => {
      const dataSukahati = processData(snapshot);
      updateData(dataSukahati);
    });

    const lainLainListener = onValue(refDbLainLain, (snapshot) => {
      const dataLainLain = processData(snapshot);
      updateData(dataLainLain);
    });

    const updateData = (newData: DataMutasiBank[]) => {
      setRowData((prevData) => {
        const combinedData = [...prevData, ...newData];
        const filteredData = combinedData.filter((item) => {
          const tanggalDB = item.tanggal?.split('@')[0];
          return today === tanggalDB;
        });
        const uniqueData = Array.from(new Set(combinedData.map((item) => item.nominal)))
          .map((id) => combinedData.find((item) => item.nominal === id)!);

        setTotalData(uniqueData.length);
        setIsLoading(false);
        return uniqueData;
      });
    };

    return () => {
      cikaretListener();
      sukahatiListener();
      lainLainListener();
    };
  }, [today]);

  return (
    <>
      <div>
        TRF HARI INI : {totalData} Nota
      </div>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          theme="legacy"
          modules={[ClientSideRowModelModule]}
          defaultColDef={{ sortable: true, filter: true }}
          loadingOverlayComponent={() => (isLoading ? <div>Loading...</div> : null)}
          rowHeight={35}
        />
      </div>
    </>
  );
}
