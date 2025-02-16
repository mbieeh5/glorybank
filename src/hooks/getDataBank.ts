"use client";
import { useState, useEffect } from "react";
import { DataSnapshot, onValue, ref } from "firebase/database";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "@/lib/BankSeparator";

const useGetDataBank = () => {
  const [rowData, setRowData] = useState<DataMutasiBank[]>([]);
  const [totalData, setTotalData] = useState<number>(0);

  useEffect(() => {
    const processData = (snapshot: DataSnapshot, lokasi: string): DataMutasiBank[] => {
      const dataVal = snapshot.val() || {};
      const dataList: DataMutasiBank[] = [];
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(dataVal).forEach(([_, transactions]) => {
        Object.entries(transactions as DataMutasiBank).forEach(([id, data]) => {
          const sanitizer = BankSeparator(data.bank)
          const bank = sanitizer === "DANAMON" ? data.bank === "DANAMON" ? data.bank : `DANAMON(${data.bank})` : data.bank;
          dataList.push({ ...data, id, lokasi, bank });
        });
      });
      return dataList;
    };

    const locations = ["Cikaret", "Sukahati", "LainLain"];
    let allData: DataMutasiBank[] = [];

    const listeners: (() => void)[] = locations.map((lokasi) => {
      const refDb = ref(DB, `Mutasi/${lokasi}`);
      return onValue(refDb, (snapshot) => {
        const newData = processData(snapshot, lokasi);
        allData = [...allData.filter((item) => item.lokasi !== lokasi), ...newData];
        setTotalData(allData.length);
        setRowData(allData);
      });
    });

    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return { rowData, totalData };
};

export default useGetDataBank;
