"use client";
import {Table as AntdTable, TableProps} from "antd";
import { DatabaseReference, get, ref } from "firebase/database";
import React, { useState, useEffect } from "react";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";

export default function TableBank() {
    const [data, setData] = useState<DataMutasiBank[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    

    const columns: TableProps<DataMutasiBank>["columns"] = [
        {
            title: "TANGGAL",
            dataIndex: 'tanggal',
            key: 'tanggal',
        },
        {
            title: "LOKASI",
            dataIndex: "lokasi",
            key: "lokasi"
        },
        {
            title: "BANK",
            dataIndex: 'bank',
            key: 'bank',
        },
        {
            title: "NOREK",
            dataIndex: "norek",
            key: "norek"
        },
        {
            title: "NOMINAL",
            dataIndex: "nominal",
            key: "nominal"
        },
        {
            title: "PENERIMA",
            dataIndex: "penerima",
            key: "penerima"
        },
        {
            title: "ADMIN",
            dataIndex: 'admin',
            key: 'admin'
        }
    ];

    useEffect(() => {
        const refDbCikaret = ref(DB, 'Mutasi/Cikaret');
        const refDbSukahati = ref(DB, 'Mutasi/Sukahati');
        setIsLoading(true);

        const getData =  async (ref: DatabaseReference) => {
            const val = await get(ref);
            return val.val() || {};
        }
        const getAllData = async() => {
            const dataCikaret = await getData(refDbCikaret);
            const dataSukahati = await getData(refDbSukahati);

           const combinedData: DataMutasiBank[] = [];
           
           // Data Cikaret
           for(const bank in dataCikaret){
            if(dataCikaret.hasOwnProperty(bank)){
                const transaction = dataCikaret[bank];
                for(const key in transaction){
                    if(transaction.hasOwnProperty(key)){
                        combinedData.push(transaction[key]);
                    }
                }
            }
           }
           // Data Sukahati
           for(const bank in dataSukahati){
            if(dataSukahati.hasOwnProperty(bank)){
                const transaction = dataSukahati[bank];
                for(const key in transaction){
                    if(transaction.hasOwnProperty(key)){
                        combinedData.push(transaction[key]);
                    }
                }
            }
           }
            return combinedData;
        }
        getAllData().then(combinedData => {
            setData(combinedData)
            setIsLoading(false)
        })
    }, []);

    return (
        <>
        <div>

        </div>
            <AntdTable<DataMutasiBank> 
            columns={columns} 
            dataSource={data}
            loading={isLoading}
            size="small"
            pagination={false}
            rowKey="tanggal" />
        </>
    );
}
