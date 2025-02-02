"use client";
import { Table as AntdTable, TableProps, Button } from "antd";
import { onValue, ref, runTransaction, update } from "firebase/database";
import React, { useState, useEffect } from "react";
import { DB } from "../../firebase-config";
import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "@/lib/BankSeparator";
import Swal from "sweetalert2";

export default function TableBank() {
    const [data, setData] = useState<DataMutasiBank[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalData, setTotalData] = useState<number>(0);

    const today = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).replace(/\//g, '/');

    // Fungsi untuk mengubah status
    const handleUpdateStatus = async (record: DataMutasiBank, newStatus: string) => {
        try {
            const sanitizerBank = BankSeparator(record.bank) || "";
            const capitalizeFirstLetter = sanitizerBank.charAt(0).toLocaleUpperCase() + sanitizerBank.slice(1).toLocaleLowerCase()
            const path = `Mutasi/${record.lokasi}/${sanitizerBank}/${record.id}`;
            const pathPenguranganSaldo =`Datas/SaldoAwal/Value${capitalizeFirstLetter}` 
            const updates = { status: newStatus };
            await update(ref(DB, path), updates);

            if(newStatus === "BATAL") {
                await runTransaction(ref(DB, pathPenguranganSaldo), (currentSaldo) => {
                    const updatedSaldo = (currentSaldo || 0) + parseInt(record.nominal.replace(/\./g, ''), 10);
                    return updatedSaldo
                })
            }
            
            setData((prevData) =>
                prevData.map((item) =>
                    item.id === record.id ? { ...item, status: newStatus } : item
                )
            );
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: `Status berhasil diubah menjadi ${newStatus}`,
            })
        } catch (error) {
            console.error("Gagal mengubah status:", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal mengubah status. Silakan coba lagi.',
            });
        }
    };

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
        },
        {
            title: "STATUS",
            dataIndex: "status",
            key: "status",
            render: (_, record) => (
                <div>
                    {record.status || 'PENDING'}
                </div>
            )
        },
        {
            title: "AKSI",
            key: "aksi",
            render: (_, record) => (
                <div>
                    <Button
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => handleUpdateStatus(record, 'SUKSES')}
                    >
                        Sukses
                    </Button>
                    <Button
                        danger
                        onClick={() => handleUpdateStatus(record, 'BATAL')}
                    >
                        Batal
                    </Button>
                </div>
            )
        }
    ];

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
            setData((prevData) => {
                const combinedData = [...prevData, ...newData];
                const filteredData = combinedData.filter((item) => {
                    const tanggalDB = item.tanggal?.split('@')[0];
                    return today === tanggalDB;
                });
                console.log(filteredData)
                const uniqueData = Array.from(new Set(filteredData.map((item) => item.nominal)))
                    .map((id) => filteredData.find((item) => item.nominal === id)!);

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
            <AntdTable<DataMutasiBank>
                columns={columns}
                dataSource={data}
                loading={isLoading}
                size="small"
                pagination={false}
                rowKey="tanggal"
            />
        </>
    );
}