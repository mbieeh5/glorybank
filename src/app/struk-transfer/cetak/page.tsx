"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface dataStruk {
    tanggal: string,
    bank: string,
    penerima: string,
    norek: string,
    pengirim: string,
    berita: string,
    nominal: string,
    admin: number,
    totalbyr: string,
    lokasi:string;
}

export default function Cetak() {

    const [data, setData] = useState<dataStruk[]>([]);
    const Router = useRouter();

    const handlePrint = () => {
        const printArea = document.getElementById('printArea');
        if (printArea) {
            const printContent = printArea.innerHTML;
            const styleSheets = Array.from(document.styleSheets)
                .map((sheet) => {
                    try {
                        return Array.from(sheet.cssRules)
                            .map((rule) => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        console.warn("Error reading CSS rules: ", e);
                        return '';
                    }
                })
                .join('\n');

            const printWindow = window.open('', '', 'width=600,height=600');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>Print</title>
                        <style>
                            ${styleSheets}
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };
    
    

    const handleBack = () => {
        Router.push('/struk-transfer')
    }

    useEffect(() => {
        const datas = sessionStorage.getItem('strukData');

        if (datas) {
            try {
                const parsedData = JSON.parse(datas);
                if (parsedData) {
                    const arrayDatas: dataStruk[] = Object.values({parsedData});
                    setData(arrayDatas);
                } else {
                    console.error("Data format is incorrect.");
                }
            } catch (error) {
                console.error("Failed to parse sessionStorage data", error);
            }
        }
    }, []);

    return (
        <>
            <section id="printArea" className="isolate bg-white px-12 py-5 rounded text-black">
            {data.length > 0 ? (
                data.map((a, i) => (
                    <div key={i} className="grid justify-items-center">
                        {a.lokasi === "Cikaret" ? 
                        <>
                            <p className="text-l font-bold tracking-tight text-gray-900 sm:text-l">Glory Cell</p>
                            <p className=" text-xs leading-3 text-gray-600">
                                JLN. RAYA CIKARET NO 002B
                            </p>
                            <p className=" text-xs text-gray-600">
                                CIBINONG - BOGOR
                            </p>
                            <p className=" text-xs leading-1 text-gray-600 border-b border-gray-900">
                                {a.tanggal}
                            </p>
                        </>
                        : <>
                            <p className="text-l font-bold tracking-tight text-gray-900 sm:text-l ">Glory Cell</p>
                            <p className=" text-xs leading-3 text-gray-600">
                                JLN. RAYA SUKAHATI NO 01
                            </p>
                            <p className=" text-xs text-gray-600">
                                CIBINONG - BOGOR
                            </p>
                            <p className=" text-xs leading-1 text-gray-600 border-b border-gray-600">
                                {a.tanggal}
                            </p>
                        </>
                        }
                        <h2 className="mt-0 text-s font-italic tracking-tight text-gray-900 sm:text-1xl">Transfer Antar Bank</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-0">
                        
                        <div className="flex items-center text-gray-700 font-medium text-sm">
                            <span className="w-[35%]">Bank</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold text-gray-900 break-words">{a.bank}</span>
                        </div>

                        
                        <div className="flex items-center text-gray-700 font-medium text-sm">
                            <span className="w-[35%]">NoRek</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold text-gray-900 break-words">{a.norek}</span>
                        </div>

                        
                        <div className="flex items-start text-gray-700 font-medium text-sm">
                            <span className="w-[35%]">Nama</span>
                            <div className="font-bold mr-1">:</div>
                            <div className="font-bold text-gray-900 break-normal w-full max-w-32">{a.penerima}</div>
                        </div>

                        
                        <div className="flex items-start text-gray-700 font-medium text-sm">
                            <span className="w-[35%]">Pengirim</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold text-gray-900 break-words">{a.pengirim}</span>
                        </div>

                       
                        <div className="flex items-start text-gray-700 font-medium text-sm">
                            <span className="w-[35%]">Berita</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold text-gray-900 break-words">{a.berita}</span>
                        </div>

                        
                        <div className="flex items-center border-b border-gray-900 py-1 text-sm">
                            <span className="w-[35%]">Nominal</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold text-gray-900">Rp. {a.nominal}.-</span>
                        </div>

                        
                        <div className="flex text-gray-700 font-medium text-[12px]">
                            <span className="font-normal text-center">
                            Struk ini sebagai bukti pembayaran yang sah mohon disimpan.
                            </span>
                        </div>

                        
                        <div className="flex items-center text-gray-700 font-medium text-[12px]">
                            <span className="w-[35%]">Admin</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold">Rp. {a.admin.toLocaleString('id-ID')}.-</span>
                        </div>

                        
                        <div className="flex items-center text-gray-700 font-medium text-[12px]">
                            <span className="w-[35%]">Total Bayar</span>
                            <div className="font-bold mr-1">:</div>
                            <span className="font-bold">Rp. {a.totalbyr}.-</span>
                        </div>

                        
                        <div className="flex flex-col text-center text-gray-700 font-medium">
                            <span className="font-normal">TERIMA KASIH</span>
                            <span className="font-normal">
                            {a.lokasi === "Cikaret" ? "CS-WA: 08811429638" : "CS-WA: 08973997575"}
                            </span>
                        </div>
                    </div>
                    </div>
                ))
            ) : (
                <p>No data available</p>
            )}
            </section>
            <div className="grid flex gap-4 justify-items-center my-4">
                <button
                onClick={() => {handlePrint()}}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    Print Data
                </button>
                <button
                onClick={() => {handleBack()}}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
                    Kembali
                </button>
            </div>
        </>
    );
}
