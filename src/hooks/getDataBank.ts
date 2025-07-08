"use client";
import { useState, useEffect } from "react";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "@/lib/BankSeparator";
import { DateCorector } from "@/lib/DateCorector";

const useGetDataBank = () => {
  const [rowData, setRowData] = useState<DataMutasiBank[]>([]);
  const [ dataPerHari, setDataPerHari ] = useState<DataMutasiBank[]>([]);
  const [totalData, setTotalData] = useState<number>(0);

  useEffect(() => {
    const processData = (snapshot: DataSnapshot): DataMutasiBank[] => {
      const dataVal = snapshot.val() || {};
      const dataList: DataMutasiBank[] = [];

     Object.entries(dataVal as Record<string, DataMutasiBank>).forEach(([key, data]: [string, DataMutasiBank]) => {
      const sanitizer = BankSeparator(data.bank);
      const bank = sanitizer === "DANAMON" ? (data.bank === "DANAMON" ? data.bank : `DANAMON(${data.bank})`) : data.bank;
      const tanggalFinal = DateCorector(data.tanggal);
      const id = key;
      dataList.push({ ...data, id, tanggal: tanggalFinal, bank });
     })
      //console.log("ID:",dataList.map(data => data.id),"nominal:",dataList.map(data => data.nominal));
      return dataList;
  };
    
    const listeners: (() => void)[] = [];
    const refDb = ref(DB, `Mutasi`);
    const unsubscribe = onValue(refDb, (snapshot) => {
      const newData = processData(snapshot);
      setRowData(newData);
      const now = new Date();
      const dataHarian = newData.filter(data => {
        const [day, month] = data.tanggal.split('@')[0].split('/').map(Number);
        return now.getDate() === day && (now.getMonth() + 1) === month;
      });
      setTotalData(dataHarian.length);
      setDataPerHari(dataHarian);
    });
    listeners.push(unsubscribe);
    
    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
  
  return { rowData, totalData, dataPerHari};
};

export default useGetDataBank;
