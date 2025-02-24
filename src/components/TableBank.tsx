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
  RowAutoHeightModule,
  ValidationModule,
  CellStyleModule,
  RowStyleModule,
  TextFilterModule,
  DateFilterModule,
  RowClassParams,
  ValueFormatterParams
} from "ag-grid-community";
import useGetDataBank from "@/hooks/getDataBank";
import Swal from "sweetalert2";
import { BankSeparator } from "@/lib/BankSeparator";
import { ref, remove, runTransaction, update } from "firebase/database";
import { auth, DB } from "../../firebase-config";
import filterParams from "./DateFilterComponent";
import { DataMutasiBank } from "@/types/main";

ModuleRegistry.registerModules([
  ClientSideRowModelApiModule,
  RowSelectionModule,
  RowApiModule,
  RowAutoHeightModule,
  ClientSideRowModelModule,
  DateFilterModule,
  CellStyleModule,
  RowStyleModule,
  TextFilterModule,
  ValidationModule/* Development Only */,
]);

function formatNumber(params: ValueFormatterParams){
  return params.value?.toLocaleString('id-ID');
}

export default function TableBank(){
  const gridRef = useRef<AgGridReact>(null);
  const { rowData, totalData, dataPerHari } = useGetDataBank();
  const [ selectedData, setSelectedData ] = useState<DataMutasiBank[]>([]);
  const [ totalDataFinal, setTotalDataFinal ] = useState<number>(0);
  const [ dataSetter, setDataSetter ] = useState<DataMutasiBank[]>([])

  const [columnDefs] = useState<ColDef[]>([
    { field: "tanggal", headerName: "TANGGAL", filter: "agDateColumnFilter", filterParams: filterParams, maxWidth: 190, autoHeight: true },
    { field: "lokasi",headerName: "LOKASI", filter: 'agTextColumnFilter', maxWidth: 100,  },
    { field: "bank", headerName: "BANK", maxWidth: 200, filter: "agTextColumnFilter" },
    { field: "norek", headerName: "NOREK", filter: "agTextColumnFilter",maxWidth: 160  },
    { field: "penerima", headerName: "NAMA", filter: "agTextColumnFilter"  },
    { field: 'saldoAwal', headerName: "SALDO AWAL", valueFormatter: formatNumber },
    { field: "nominal", headerName: "NOMINAL",maxWidth: 100  },
    { field: "saldoAkhir", headerName: "SALDO AKHIR", valueFormatter: formatNumber},
    { field: "admin", headerName: "ADMIN", maxWidth: 100, hide: true  },
    { field: "status", headerName: "STATUS",maxWidth: 100, filter: 'agTextColumnFilter' }
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
          const akun = auth.currentUser?.email;
          const tanggalStatus = new Date().toISOString();
          const testingUpdateData = {[item.id] : {...item, akun, tanggalStatus}}

            if(newStatus === "SUKSES"){
              await update(ref(DB, 'History/Mutasi/'),testingUpdateData)
              await runTransaction(ref(DB, pathSaldo), (currentSaldo) => (currentSaldo || 0) - parseInt(item.nominal.replace(/\./g,""), 10));
            }

            if(newStatus === "BATAL" || newStatus === "PENDING"){
              await update(ref(DB, 'History/Mutasi/'),testingUpdateData)
              await runTransaction(ref(DB, pathSaldo), (currentSaldo) => (currentSaldo || 0) + parseInt(item.nominal.replace(/\./g,""), 10));
            }

            if(newStatus === "HAPUS"){
              await update(ref(DB,'History/TempatSampah/'),testingUpdateData);
              await remove(ref(DB, `${path}${item.id}`));
              return;
            }
            

          await update(ref(DB, 'History/Pelunasan/'), testingUpdateData);
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

  const onSelectionChanged = useCallback(() => {
    if(!gridRef.current) return;
    //const selectedRows = gridRef.current.api.getSelectedRows();
    const selectedRows = gridRef.current.api.getRenderedNodes().filter(node => node.isSelected()).map(node => node.data);
    setSelectedData(selectedRows);
  }, [])

  const TotalNominal = useMemo(() => {
    return selectedData.reduce((sum, item) => sum + parseInt(item.nominal.replace(/\./g, ""), 10), 0);
  },[selectedData])

  const totalAdmin = useMemo(() => {
    return selectedData.reduce((sum, item) => sum + (item.admin ? parseInt(item.admin.replace(/\./g, ""), 10) : 0), 0);
  },[selectedData])

  const maxHeightFAB = selectedData.length > 6 ? "19rem" : 'auto';

  const onFilterChanged = useCallback(() => {
    setDataSetter(rowData);
    if(gridRef.current) {
      const filterCount = gridRef.current.api.getDisplayedRowCount();
      setTotalDataFinal(filterCount);
    }
  },[rowData])

 const getRowClass = (params: RowClassParams) => {
  const status = params.data.status;
  if(status === "LUNAS"){
    return 'row-lunas';
  }else if(status === "SUKSES"){
    return 'row-sukses';
  }else if(status === "BATAL"){
    return 'row-batal';
  }else if(status === "PENDING"){ 
    return 'row-pending'
  }
  return ''
 }

  return (
<div className="container mx-auto p-4">
  <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-center">TOTAL NOTA : {totalDataFinal === 0 ? totalData : totalDataFinal}</h2>
      <div className="flex flex-grow mt-7 relative lg:flex-row flex-col">
      <div className="ag-theme-alpine flex-grow" style={{ height: '30rem' }}>
        <AgGridReact
          ref={gridRef}
          rowData={dataSetter.length < 1 ? dataPerHari : dataSetter}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          onSelectionChanged={onSelectionChanged}
          onFilterChanged={onFilterChanged}
          getRowClass={getRowClass}
        />
      </div>
      {selectedData.length > 0 && (
        <div className="hidden lg:block flex-shrink-0 w-80 ml-4">
          <div className="bg-gray-100 p-4 rounded-lg shadow-lg h-fit">
          {selectedData.some((item) => item.lokasi === "Cikaret") && selectedData.some((item) => item.lokasi === "Sukahati") ? (
              <>
                {selectedData.some((item) => item.lokasi === "Cikaret") && (
                  <h3 className="text-lg font-bold mb-1">
                    TOTAL {selectedData.filter((item) => item.lokasi === "Cikaret").length} NOTA CIKARET
                  </h3>
                )}
                {selectedData.some((item) => item.lokasi === "Sukahati") && (
                  <h3 className="text-lg font-bold mb-1">
                    TOTAL {selectedData.filter((item) => item.lokasi === "Sukahati").length} NOTA SUKAHATI
                  </h3>
                )}
              <h3 className="text-lg font-bold mb-1">
                TOTAL {selectedData.filter((item) => item.lokasi === "Cikaret").length + selectedData.filter((item) => item.lokasi === "Sukahati").length} NOTA
              </h3>
              </>
            ) : (
              <>
                {selectedData.some((item) => item.lokasi === "Cikaret") && (
                  <h3 className="text-lg font-bold mb-2">
                    TOTAL {selectedData.filter((item) => item.lokasi === "Cikaret").length} NOTA CIKARET
                  </h3>
                )}
                {selectedData.some((item) => item.lokasi === "Sukahati") && (
                  <h3 className="text-lg font-bold mb-2">
                    TOTAL {selectedData.filter((item) => item.lokasi === "Sukahati").length} NOTA SUKAHATI
                  </h3>
                )}
              </>
            )}
            <div className="mt-4" style={{maxHeight: maxHeightFAB, overflowY: "auto"}}>
              {selectedData.map((d) => (
                <div key={d.id} className="mb-2 p-2 border-b border-gray-300">
                  <strong>{d.bank}</strong> {d.nominal}
                </div>
              ))}
            </div>
            <p><strong>NOMINAL :</strong> Rp {TotalNominal.toLocaleString()}</p>
            <p><strong>ADMIN :</strong> Rp {(totalAdmin).toLocaleString()}</p>
            <p><strong>TOTAL :</strong> Rp {(totalAdmin + TotalNominal).toLocaleString()}</p>
          <div className="flex flex-col mb-1 mt-1 text-center">
            <button 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("LUNAS")}>
              TANDAI LUNAS
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("SUKSES")}>
              TANDAI SUKSES
            </button>
            <button 
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("PENDING")}>
              TANDAI PENDING
            </button>
            <button 
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("BATAL")}>
              BATALKAN
            </button>
            <button 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("HAPUS")}>
              HAPUS
            </button>
          </div>
          </div>
        </div>
      )}
      {selectedData.length > 0 && (
        <div className="lg:hidden w-full mt-4">
          <div className="bg-gray-100 p-4 rounded-lg shadow-lg h-fit">
          <h3 className="text-lg font-bold mb-2">Total Nota {selectedData.length}</h3>
            <p><strong>NOMINAL :</strong> Rp {TotalNominal.toLocaleString()}</p>
            <p><strong>ADMIN :</strong> Rp {(totalAdmin).toLocaleString()}</p>
          </div>
          <div className="flex flex-col mb-1 mt-1 text-center">
            <button 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("LUNAS")}>
              TANDAI LUNAS
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("SUKSES")}>
              TANDAI SUKSES
            </button>
            <button 
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("PENDING")}>
              TANDAI PENDING
            </button>
            <button 
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("BATAL")}>
              BATALKAN
            </button>
            <button 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-2" 
              onClick={() => updateItems("HAPUS")}>
              HAPUS
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  );
};