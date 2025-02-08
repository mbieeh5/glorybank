"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  RowApiModule,
  RowSelectionModule,
  RowSelectionOptions,
  ValidationModule,
} from "ag-grid-community";
import useGetDataBank from "@/hooks/getDataBank";
import Swal from "sweetalert2";
import { BankSeparator } from "@/lib/BankSeparator";
import { ref, remove, runTransaction, update } from "firebase/database";
import { DB } from "../../firebase-config";

ModuleRegistry.registerModules([
  ClientSideRowModelApiModule,
  RowSelectionModule,
  RowApiModule,
  ClientSideRowModelModule,
  ValidationModule
]);

export default function TableBank(){
  const gridRef = useRef<AgGridReact>(null);
  const {rowData, totalData} = useGetDataBank();
  const [columnDefs] = useState<ColDef[]>([
    { field: "tanggal", headerName: "TANGGAL" },
    { field: "lokasi",headerName: "LOKASI"  },
    { field: "bank", headerName: "BANK" },
    { field: "norek", headerName: "NOREK" },
    { field: "penerima", headerName: "NAMA" },
    { field: "nominal", headerName: "NOMINAL" },
    { field: "status", headerName: "STATUS" },
  ]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
    };
  }, []);

  const rowSelection = useMemo<RowSelectionOptions | "single" | "multiple">(() => {
    return { mode: "multiRow" };
  }, []);

  const updateItems = useCallback(async (newStatus: string) => {
    try {
      const selected = gridRef.current!.api.getSelectedRows();
      const koreksiJikaStatusSama = selected.map(item => {return item.status});

      if(selected.length < 1){
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Silahkan pilih data untuk di edit',
        })
      }

      if(koreksiJikaStatusSama.includes(newStatus)){
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Silahkan status lama tidak boleh sama dengan yang baru',
        })
      }

      if((koreksiJikaStatusSama.includes('SUKSES') || koreksiJikaStatusSama.includes("LUNAS") || koreksiJikaStatusSama.includes("PENDING"))&& newStatus === "HAPUS"){
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Transaksi Sukses/Lunas Dan Pending Tidak Dapat di Hapus',
        })
      }

      const updatedData = selected.map(item => ({
        ...item,
        status: newStatus
      }));
      
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Anda akan mengubah status menjadi ${newStatus}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, ubah!',
        cancelButtonText: 'Batal'
      });

      if(!result.isConfirmed){
        return;
      }

      if(result.isConfirmed){
        updatedData.forEach(async item => {
          const itemToUpdate = {[item.id] : item}
          const sanitizerBank = BankSeparator(item.bank) || "";
          const path = `Mutasi/${item.lokasi}/${sanitizerBank}/`;
          const capitalizeFirstLetter = sanitizerBank.charAt(0).toUpperCase() + sanitizerBank.slice(1).toLowerCase();
          const pathSaldo = `Datas/SaldoAwal/Value${capitalizeFirstLetter}`;

            if(newStatus === "SUKSES"){
              await runTransaction(ref(DB, pathSaldo), (currentSaldo) => (currentSaldo || 0) - parseInt(item.nominal.replace(/\./g,""), 10));
            }

            if(newStatus === "BATAL" || newStatus === "PENDING"){
              await runTransaction(ref(DB, pathSaldo), (currentSaldo) => (currentSaldo || 0) + parseInt(item.nominal.replace(/\./g,""), 10));
            }

            if(newStatus === "HAPUS"){
              await update(ref(DB,'History/TempatSampah/'),itemToUpdate);
              await remove(ref(DB, `${path}${item.id}`));
              return;
            }

        await update(ref(DB, path), itemToUpdate)
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Status berhasil diubah menjadi ${newStatus}`,
        })
      });
      }
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '',
      })
    }
  }, []);

  return (
<div className="container mx-auto p-4">
  <div className="flex flex-col h-full">
      <div className="mb-1 mt-1 text-center">
        <h2 className="text-xl font-bold mb-2">TOTAL NOTA : {totalData}</h2>
        <button 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2" 
          onClick={() => updateItems("LUNAS")}>
          TANDAI LUNAS
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" 
          onClick={() => updateItems("SUKSES")}>
          TANDAI SUKSES
        </button>
        <button 
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2" 
          onClick={() => updateItems("PENDING")}>
          TANDAI PENDING
        </button>
        <button 
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mr-2" 
          onClick={() => updateItems("BATAL")}>
          BATALKAN
        </button>
        <button 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2" 
          onClick={() => updateItems("HAPUS")}>
          HAPUS
        </button>
      </div>
    <div className="flex-grow mt-7">
      <div className="ag-theme-alpine" style={{ height: '30rem' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
        />
      </div>
    </div>
  </div>
</div>
  );
};