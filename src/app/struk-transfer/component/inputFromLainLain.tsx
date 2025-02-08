'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { push, ref, runTransaction } from 'firebase/database';
import { DB } from '../../../../firebase-config';
import Loading from '@/components/Loading';


export default function StrukLainLain() {
  
  const [nominal, setNominal] = useState<number>(10000);
    const [admin, setAdmin] = useState<number>(0);
    const [totalByr, setTotalByr] = useState<number>(0);
    const [tanggal, setTanggal] = useState<string>("")
    const [ isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year}@${hours}:${minutes}:${seconds}`;
    };

    const calculation = useCallback((num: number) => {
        setAdmin(admin);
        setTotalByr(admin + num);
        return;
    },[admin])

    const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    
      setIsLoading(true);
    
      try {
        setTanggal(formatDate(new Date()));
    
        const formData = new FormData(e.currentTarget);
        const SN = formData.get('SN') as string;
        const nomorTujuan = formData.get('NomorTujuan') as string;
        const nominal = formData.get('nominal') as string;
        const nominalConverter = parseInt(nominal).toLocaleString('id-ID');
        const admin = formData.get('admin') as string;
        const adminConverter = parseInt(admin).toLocaleString('id-ID');
        const totalbyr = formData.get('totalbyr') as string;
        const tipeStruk = formData.get('type') as string;
        const lokasi = formData.get('lokasi') as string;
    
        const dataStruk = {
          tanggal: tanggal.toString(),
          tipeStruk,
          lokasi,
          nomorTujuan,
          SN,
          nominal: nominalConverter,
          admin: adminConverter,
          totalbyr,
        };
    
        const bank = tipeStruk.split(' ')[2];
        const penerimanya = tipeStruk.split(' ')[0];
        
        if (bank) {
          const sisaSaldoBCA = ref(DB, 'Datas/SaldoAwal/ValueBca');
          const totalByrConverter = totalByr.toLocaleString('id-ID');
          await runTransaction(sisaSaldoBCA, (currentSaldo) => {
            return currentSaldo - parseInt(nominal);
          });
    
          const DataMutas = ref(DB, `Mutasi/${lokasi}/${bank}`);
          const dataStrukMutasi = {
            tanggal: tanggal.toString(),
            bank,
            lokasi,
            norek: nomorTujuan,
            penerima: penerimanya,
            nominal: nominalConverter,
            admin: adminConverter,
            status: "SUKSES",
            totalbyr: totalByrConverter,
          };
    
          await push(DataMutas, dataStrukMutasi);
        }
        
        sessionStorage.setItem('strukDataLain', JSON.stringify(dataStruk));
        router.push('/struk-transfer/cetak/lain-lain');
    
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    

    const handleResetForm = () => {
    location.reload();
    }

  useEffect(() => {
    
    const dateNow:Date = new Date();
    setTanggal(formatDate(dateNow));
    calculation(nominal)
}, [calculation, nominal]);

  return (
    <div>
      {isLoading ? (<Loading/>) : (
        
      <form action="#" method="POST" className="mx-automax-w-m" onSubmit={handleOnSubmit}>
        <div className="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-1">
          <div className='sm:col-span-2'>
          <div className='sm:col-span2'>
          <label htmlFor="lokasi" className="block text-sm font-semibold leading-1 text-gray-900">
              Lokasi
            </label>
              <select 
              id='lokasi'
              name='lokasi'
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option>Cikaret</option>
                <option>Sukahati</option>
              </select>
          </div>
          <label htmlFor="type" className="block text-sm font-semibold leading-6 text-gray-900">
              Tipe Struk
            </label>
              <select 
              id='type'
              name='type'
                className="block w-full h-8 rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                <option>DANA</option>
                <option>DANA Pake BCA</option>
                <option>GOPAY</option>
                <option>GOPAY Pake BCA</option>
                <option>SHOPEEPAY</option>
                <option>SHOPEEPAY Pake BCA</option>
              </select>
          </div>
          <div className='sm:col-span-2'>

            <label htmlFor="Nomor Tujuan" className="block text-sm font-semibold leading-6 text-gray-900">
             Nomor Tujuan
            </label>
            <div className="mt-2.5">
              <input
                id="NomorTujuan"
                name="NomorTujuan"
                type="text"
                autoComplete="phoneNumber"
                required
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
          </div>
          </div>
          <div className='sm:col-span-2'>
            <label htmlFor="sn" className="block text-sm font-semibold leading-6 text-gray-900">
             SN
            </label>
            <div className="mt-2.5">
              <input
                id="SN"
                name="SN"
                type="text"
                autoComplete="sn"
                required
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="nominal" className="block text-sm font-semibold leading-6 text-gray-900">
              Nominal
            </label>
            <div className="mt-2.5">
              <input
                id="nominal"
                name="nominal"
                type="text"
                pattern="[0-9]*"
                value={nominal}
                autoComplete="nominal"
                required
                onChange={(e) => {setNominal(parseInt(e.target.value))}}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="admin" className="block text-sm font-semibold leading-6 text-gray-900">
              Admin
            </label>
            <div className="mt-2.5">
              <input
                id="admin"
                name="admin"
                value={admin}
                onChange={(e) => {setAdmin(parseInt(e.target.value))}}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="totalbyr" className="block text-sm font-semibold leading-6 text-gray-900">
              Total Bayar
            </label>
            <div className="mt-2.5">
              <input
                id="totalbyr"
                name="totalbyr"
                readOnly
                value={totalByr.toLocaleString('id-ID')}
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
        <div className="mt-10">
          <button
            type="submit"
            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cetak
          </button>
          </div>
          <div className="mt-10">
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
