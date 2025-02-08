"use client";
import MutasiHarian from "@/components/MutasiHarian";
import ReminingBalance from "@/components/ReminingBalance";
import TableBank from "@/components/TableBank";
import React from "react";

export default function Home() {

  return (
    <div className="py-2">
      <div className="m-2 flex justify-between w-full">
        <div className="flex-1 md:flex md:flex-row">
          <div className="md:flex-1">
            <ReminingBalance />
          </div>
          <div className="md:flex-1 md:text-right">
            <MutasiHarian />
          </div>
        </div>
      </div>
      <main className="">
        <TableBank />
      </main>
    </div>
  );
}