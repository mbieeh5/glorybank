"use client"
import React from "react";
import InputForm from "./component/inputForm";
import StrukLainLain from "./component/inputFromLainLain";



export default function CetakStruk() {
    const [activeComponent, setActiveComponent] = React.useState<'transfer' | 'lain-lain'>('transfer');

    return(
    <div className="flex flex-col items-center bg-white-100 p-2 mt-12">
        <div className="scale-150 transform mt-36">        
            <div className="flex flex-col items-center justify-center pt-1">
            <div className="flex gap-4 mb-3">
                <button
                onClick={() => setActiveComponent('transfer')}
                className={`px-1 py-1 rounded-md font-semibold text-white text-xs ${
                    activeComponent === 'transfer' ? 'bg-indigo-600' : 'bg-gray-400'
                } hover:bg-indigo-500 transition`}
                >
                Struk Transfer
                </button>

                <button
                onClick={() => setActiveComponent('lain-lain')}
                className={`px-1 py-1 rounded-md font-semibold text-white text-xs ${
                    activeComponent === 'lain-lain' ? 'bg-indigo-600' : 'bg-gray-400'
                } hover:bg-indigo-500 transition`}
                >
                Struk Lain Lain
                </button>
            </div>
            <div className="w-s max-w-s h-s">
                {activeComponent === 'transfer' ? <InputForm /> : <StrukLainLain />}
            </div>
            </div>
        </div>
    </div>
    )
}