import GradientTextDefault from "@/components/GradientTextDefault";
import ReminingBalance from "@/components/ReminingBalance";
import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <GradientTextDefault
                    colors={["#1a1a1a", "#4079ff", "#1a1a1a", "#4079ff", "#1a1a1a"]}
                    animationSpeed={3}
                    showBorder={false}
                    className="p-3"><h1 className="text-6xl font-bold">
                    Welcome to <p className="text-blue-600">Glory Bank</p>
                  </h1></GradientTextDefault>
        <ReminingBalance/>
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <a href="/data-transfer" className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Data Transfer &rarr;</h3>
            <p className="mt-4 text-xl">
              Data BCA/BRI/DANAMON & Rekap Harian.
            </p>
          </a>
          <a href="/struk-transfer" className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Cetak Struk &rarr;</h3>
            <p className="mt-4 text-xl">
              Cetak Struk di sini, jangan salah pilih lokasi ya.
            </p>
          </a>
          <a href="/admin-section" className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
            <h3 className="text-2xl font-bold">Admin Section &rarr;</h3>
            <p className="mt-4 text-xl">
              Admin only.
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}