"use client";
import MutasiHarian from "@/components/MutasiHarian";
import ReminingBalance from "@/components/ReminingBalance";
import TableBank from "@/components/TableBank";
import React from "react";

export default function Home() {

  return (
    <div className="py-2">
      <div className="m-2 flex justify-between w-full">
        <div className="flex-1">
          <ReminingBalance />
        </div>
        <div className="flex-1 text-right">
          <MutasiHarian />
        </div>
      </div>
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
        <TableBank />
            </div>
      </main>
    </div>
  );
}