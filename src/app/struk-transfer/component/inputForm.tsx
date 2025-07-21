'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { DB } from '../../../../firebase-config';
import { get, push, ref, runTransaction, set } from 'firebase/database';
import { BankSeparator } from '@/lib/BankSeparator';
import Loading from '@/components/Loading';
import Swal from 'sweetalert2';


export default function InputForm() {
  
  const [nominal, setNominal] = useState<string>("10.000");
    const [bank, setBank] = useState<string>('');
    const [penerima, setPenerima] = useState<string>('');
    const [admin, setAdmin] = useState<string>('0');
    const [totalByr, setTotalByr] = useState<number>(0);
    const [tanggal, setTanggal] = useState<string>("")
    const [lokasi, setLokasi] = useState<string>('Cikaret');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

// 🔧 Helper Functions
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year}@${hours}:${minutes}:${seconds}`;
};
function capitalizeFirstLetter(text: string):string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
const parseRupiah = (value: string): number => parseInt(value.replace(/\./g, '') || '0');
const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value.replace(/\./g, '');
  const formattedValue = parseInt(rawValue || "0").toLocaleString('id-ID');
  setNominal(formattedValue);
};
const calculation = useCallback((num: number) => {
  const ranges = [
    { max: 500_000, fee: 5_000 },
    { max: 1_000_000, fee: 10_000 },
    { max: 3_000_000, fee: 15_000 },
    { max: 5_000_000, fee: 20_000 },
    { max: 10_000_000, fee: 25_000 },
  ];

  for (let range of ranges) {
    if (num <= range.max) {
      setAdmin(range.fee.toLocaleString('id-ID'));
      setTotalByr(range.fee + num);
      return;
    }
  }

  const cleanAdmin = parseRupiah(admin);
  setAdmin(cleanAdmin.toLocaleString('id-ID'));
  setTotalByr(cleanAdmin + num);
}, [admin]);

const runSaldoTransaction = async (
  bankKey: string,
  nominal: number,
  minSaldo: number = 20000
): Promise<{ committed: boolean; saldoAwal: number; saldoAkhir: number }> => {
  const saldoRef = ref(DB, `Datas/SaldoAwal/Value${capitalizeFirstLetter(bankKey)}`);
  const saldoSnapshot = await get(saldoRef);
  const saldoAwal = saldoSnapshot.val();
  const saldoAkhir = saldoAwal - nominal;

  if(saldoAkhir <= minSaldo){
    return { committed: false, saldoAwal, saldoAkhir };
  }

  const result = await runTransaction(saldoRef, (currentSaldo) => {
    const data = (currentSaldo || 0 ) - nominal;
    return data;
  });

  return { committed: result.committed, saldoAwal, saldoAkhir };
};

const showErrorSaldo = (bank: string, sisaSaldo: number) => {
  Swal.fire({
    icon: 'error',
    title: `Saldo ${bank} tidak mencukupi`,
    html: `Sisa Saldo <strong>Rp ${sisaSaldo ? sisaSaldo.toLocaleString("ID") : ""}</strong>.<br>Saldo tidak boleh kurang dari <strong>Rp 20.000</strong>.<br>Telpon Rafi buat top up saldo <strong>${bank}</strong>.`,
  });
};

const handleBankTransaction = async (sanitizerBank: string, nominal: number) => {
  const result = await runSaldoTransaction(sanitizerBank, nominal);
  if (!result.committed) {
    showErrorSaldo(sanitizerBank, result.saldoAwal);
    return { isSaldoCukup: false, ...result };
  }

  // Khusus Danamon ada pengurangan sisa free
  if (sanitizerBank === 'DANAMON') {
    const sisaFreeRef = ref(DB, 'Datas/SisaFree/ValueFreeDanamon');
    const sisaFreeSnapshot = await get(sisaFreeRef);
    const sisaFreeValue = sisaFreeSnapshot.val();
    await set(sisaFreeRef, sisaFreeValue - 1);
  }

  return { isSaldoCukup: true, ...result };
};

// 🧾 HANDLE FORM SUBMIT
const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setTanggal(formatDate(new Date()));
  setIsLoading(true);

  try {
    const formData = new FormData(e.currentTarget);
    const bank = formData.get('bank') as string;
    const lokasi = formData.get('lokasi') as string;
    const norek = formData.get('norek') as string;
    const penerima = formData.get('penerima') as string;
    const berita = (formData.get('berita') as string) || "GloryCell";
    const totalbyr = formData.get('totalbyr') as string;

    const nominalValue = parseRupiah(nominal);
    const sanitizerBank = BankSeparator(bank);

    if (!sanitizerBank) {
      Swal.fire({
        icon: 'error',
        title: 'Bank tidak valid',
        text: 'Silakan pilih bank yang valid.',
      });
      return;
    }
    const { isSaldoCukup, saldoAwal, saldoAkhir } = await handleBankTransaction(sanitizerBank, nominalValue);

    if (isSaldoCukup) {
      const dataStruk = {
        tanggal: formatDate(new Date()),
        lokasi,
        bank,
        norek,
        penerima,
        pengirim: "RAFI ANGGORO",
        berita,
        nominal,
        admin,
        totalbyr,
        status: 'SUKSES',
        saldoAwal,
        saldoAkhir,
      };

      const dataUser = { bank, norek, penerima };
        const DataUsers = ref(DB, `Datas/UserInfo/`);
        const DataMutasi = ref(DB, `Mutasi/`);
    
        await Promise.all([push(DataMutasi, dataStruk), push(DataUsers, dataUser)]);
      sessionStorage.setItem('strukData', JSON.stringify(dataStruk));
      router.push('/struk-transfer/cetak');
    }
  } catch (error) {
    console.error("Error saat menyimpan data:", error);
  } finally {
    setIsLoading(false);
  }
};

// 🔄 Reset
const handleResetForm = () => location.reload();

// 🕒 Tanggal & Nominal Update
useEffect(() => {
  setTanggal(formatDate(new Date()));
  calculation(parseRupiah(nominal));
}, [calculation, nominal]);


  return (
    <div>
      {isLoading ? (<Loading/>) : (
      <form action="#" method="POST" className="mx-automax-w-m" onSubmit={handleOnSubmit}>
        <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-1">
          <div className='sm:col-span2'>
          <label htmlFor="lokasi" className="block text-sm font-semibold leading-1 text-gray-900">
              Lokasi
            </label>
              <select 
              id='lokasi'
              name='lokasi'
              value={lokasi}
              onChange={(e) => {setLokasi(e.target.value)}}
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option>Cikaret</option>
                <option>Sukahati</option>
                <option>LainLain</option>
              </select>
          </div>
          <div className='sm:col-span-2'>
            <label htmlFor="bank" className="block text-sm font-semibold leading-1 text-gray-900">
              Bank
            </label>
              <input
                id="bank"
                name="bank"
                type="text"
                autoComplete="bank"
                value={bank.toLocaleUpperCase()}
                onChange={(e) => {setBank(e.target.value)}}
                required
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
          </div>
          <div className='sm:col-span-2'>
            <label htmlFor="norek" className="block text-sm font-semibold text-gray-900">
              Nomor Rekening
            </label>
            <div>
              <input
                id="norek"
                name="norek"
                type="text"
                pattern="[0-9]*"
                autoComplete="norek"
                required
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className='sm:col-span-2'>
            <label htmlFor="penerima" className="block text-sm font-semibold leading-6 text-gray-900">
              Nama Penerima
            </label>
            <div>
              <input
                id="penerima"
                name="penerima"
                type="text"
                autoComplete="family-name"
                value={penerima.toLocaleUpperCase()}
                onChange={(e) => {setPenerima(e.target.value)}}
                required
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="berita" className="block text-sm font-semibold leading-6 text-gray-900">
              Berita
            </label>
              <input
                id="berita"
                name="berita"
                type="text"
                autoComplete="berita"
                required
                defaultValue={'GloryCell'}
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="nominal" className="block text-sm font-semibold leading-6 text-gray-900">
              Nominal
            </label>
              <input
                id="nominal"
                name="nominal"
                type="text"
                value={nominal}
                autoComplete="nominal"
                required
                onChange={handleNominalChange}
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="admin" className="block text-sm font-semibold leading-6 text-gray-900">
              Admin
            </label>
              <input
                id="admin"
                name="admin"
                value={admin}
                onChange={(e) => {setAdmin(e.target.value)}}
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="totalbyr" className="block text-sm font-semibold leading-6 text-gray-900">
              Total Bayar
            </label>
              <input
                id="totalbyr"
                name="totalbyr"
                readOnly
                value={totalByr.toLocaleString('id-ID')}
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
          </div>
        </div>
        <div className="mt-1">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cetak
          </button>
          </div>
          <div className="mt-1">
          <button
            type="button"
            onClick={() => {handleResetForm()}}
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
            Reset
          </button>
            </div>
      </form>
    )}
    </div>
  )
}
