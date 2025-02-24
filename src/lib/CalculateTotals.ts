import { DataVal } from "@/types/main";

const Tanggal = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
const Bulan = new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
const Tahun = new Date().getFullYear();

export const calculateTotalsHarian = (dataVal: DataVal) => {
            let totalNominal = 0;
            let totalNota = 0;
            let totalSemua = 0;
    
            for (const bank in dataVal) {
                if (dataVal.hasOwnProperty(bank)) {
                    const transactions = dataVal[bank];
                    for (const key in transactions) {
                        if (transactions.hasOwnProperty(key)) {
                            const transaction = transactions[key];
                            const isDateNow = transaction.tanggal.split("@")[0];
                            const isSucceess = transaction.status
                            const filters = (transaction.nominal && `${Tanggal}/${Bulan}/${Tahun}` === isDateNow) && (isSucceess === "SUKSES") ;
                            if (filters) {
                                const totalBayar = transaction.totalbyr || transaction.totalByr;
                                totalNota++;
                                totalNominal += parseInt(transaction.nominal.replace(/\./g, ''), 10);
                                if (totalBayar) {
                                    totalSemua += parseInt(totalBayar.replace(/\./g, ''), 10);
                                }
                            }
                        }
                    }
                }
            }
            return { totalNominal, totalNota, totalSemua };
};

export const calculateTotalsGlobal = (dataVal: DataVal) => {
    let totalNominal = 0;
    let totalNota = 0;
    let totalAdmin = 0;
    let totalSemua = 0;

    for (const bank in dataVal) {
        if (dataVal.hasOwnProperty(bank)) {
            const transactions = dataVal[bank];
            for (const key in transactions) {
                if (transactions.hasOwnProperty(key)) {
                    const transaction = transactions[key];
                    const isSucceess = transaction.status
                    console.log(transaction.lokasi)
                    const filters = (transaction.nominal) && (isSucceess !== "PENDING") && (transaction.lokasi !== "LainLain") ;
                    if (filters) {
                        const totalBayar = transaction.totalbyr || transaction.totalByr;
                        totalNota++;
                        totalAdmin += parseInt(transaction.admin.replace(/\./g, ''), 10)
                        totalNominal += parseInt(transaction.nominal.replace(/\./g, ''), 10);
                        if (totalBayar) {
                            totalSemua += parseInt(totalBayar.replace(/\./g, ''), 10);
                        }
                    }
                }
            }
        }
    }
    return { totalNominal, totalNota, totalSemua, totalAdmin };
  };