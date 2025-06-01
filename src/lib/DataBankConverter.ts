import { DataMutasiBank } from "@/types/main";
import { BankSeparator } from "./BankSeparator";

export function convertDataBank(data: DataMutasiBank[]){ 

    const dataFiltered = data.filter(data => {
        const dataStatus = data.status;
        const dataLokasi = data.lokasi;
        return dataStatus === "LUNAS" && dataLokasi !== "LainLain";
    })

    const countedData: Record<string, Record<string, {Nota: number; TotalAdmin: number}>> = {};

    dataFiltered.forEach(data => {
        const bank = BankSeparator(data.bank);
        const lokasi  = data.lokasi;
        const admin = parseInt(data.admin?.replace(/\./g,'') || "0", 10);

        if (bank && !countedData[bank]) {
            countedData[bank] = {}
        }

        if(bank && !countedData[bank][lokasi]) {
            countedData[bank][lokasi] = {Nota : 0, TotalAdmin: 0};
        }

        if (bank) {
            countedData[bank][lokasi].Nota++;
            countedData[bank][lokasi].TotalAdmin += admin;
        }
    });

    return {rawCountedData: countedData};
}