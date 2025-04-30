import { DataVal } from "@/types/main";

const Tanggal = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
const Bulan = new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
const Tahun = new Date().getFullYear();

export const calculateTotalsHarian = (dataVal: DataVal) => {
    // Inisialisasi objek untuk menyimpan total berdasarkan lokasi
    const totals = {
        TotalNominalCikaret: 0,
        TotalNominalSukahati: 0,
        TotalNominalLainLain: 0,
        TotalNotaCikaret: 0,
        TotalNotaSukahati: 0,
        TotalNotaLainLain: 0,
        TotalSemuaCikaret: 0,
        TotalSemuaSukahati: 0,
        TotalSemuaLainLain: 0,
    };

    const dataArray = Object.values(dataVal);
    
    // Filter data berdasarkan tanggal dan status
    const filteredTransactions = dataArray.filter(transaction => {
        const transactionDate = transaction.tanggal.split("@")[0];
        const transactionStatus = transaction.status;
        return transactionDate === `${Tanggal}/${Bulan}/${Tahun}` && transactionStatus === "SUKSES";
    });

    // Hitung total berdasarkan transaksi yang sudah difilter
    filteredTransactions.forEach(transaction => {
        const totalBayar = transaction.totalbyr || transaction.totalByr;
        const nominal = parseInt(transaction.nominal.replace(/\./g, ''), 10);
        
        // Menentukan lokasi dan menambahkan total sesuai lokasi
        switch (transaction.lokasi) {
            case 'Cikaret':
                totals.TotalNominalCikaret += nominal;
                totals.TotalNotaCikaret++;
                if (totalBayar) {
                    totals.TotalSemuaCikaret += parseInt(totalBayar.replace(/\./g, ''), 10);
                }
                break;
            case 'Sukahati':
                totals.TotalNominalSukahati += nominal;
                totals.TotalNotaSukahati++;
                if (totalBayar) {
                    totals.TotalSemuaSukahati += parseInt(totalBayar.replace(/\./g, ''), 10);
                }
                break;
            case 'LainLain':
                totals.TotalNominalLainLain += nominal;
                totals.TotalNotaLainLain++;
                if (totalBayar) {
                    totals.TotalSemuaLainLain += parseInt(totalBayar.replace(/\./g, ''), 10);
                }
                break;
            default:
                break;
        }
    });

    return {totals};
};

export const calculateTotalsGlobal = (dataVal: DataVal) => {
    // Inisialisasi objek untuk menyimpan total berdasarkan lokasi
    const totals = {
        TotalNominalCikaret: 0,
        TotalNominalSukahati: 0,
        TotalNominalLainLain: 0,
        TotalNotaCikaret: 0,
        TotalNotaSukahati: 0,
        TotalNotaLainLain: 0,
        TotalSemuaCikaret: 0,
        TotalSemuaSukahati: 0,
        TotalSemuaLainLain: 0,
    };

    const dataArray = Object.values(dataVal);
    
    // Filter data berdasarkan tanggal dan status
    const filteredTransactions = dataArray.filter(transaction => {
        const transactionDate = transaction.tanggal.split("@")[0];
        const transactionStatus = transaction.status;
        return transactionDate === `${Tanggal}/${Bulan}/${Tahun}` && transactionStatus === "SUKSES";
    });

    // Hitung total berdasarkan transaksi yang sudah difilter
    filteredTransactions.forEach(transaction => {
        const totalBayar = transaction.totalbyr || transaction.totalByr;
        const nominal = parseInt(transaction.nominal.replace(/\./g, ''), 10);
        
        // Menentukan lokasi dan menambahkan total sesuai lokasi
        switch (transaction.lokasi) {
            case 'Cikaret':
                totals.TotalNominalCikaret += nominal;
                totals.TotalNotaCikaret++;
                if (totalBayar) {
                    totals.TotalSemuaCikaret += parseInt(totalBayar.replace(/\./g, ''), 10);
                }
                break;
            case 'Sukahati':
                totals.TotalNominalSukahati += nominal;
                totals.TotalNotaSukahati++;
                if (totalBayar) {
                    totals.TotalSemuaSukahati += parseInt(totalBayar.replace(/\./g, ''), 10);
                }
                break;
            case 'LainLain':
                totals.TotalNominalLainLain += nominal;
                totals.TotalNotaLainLain++;
                if (totalBayar) {
                    totals.TotalSemuaLainLain += parseInt(totalBayar.replace(/\./g, ''), 10);
                }
                break;
            default:
                break;
        }
    });

    return {totals};
  };