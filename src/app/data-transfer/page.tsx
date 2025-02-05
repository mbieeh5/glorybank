import MutasiHarian from "@/components/MutasiHarian";
import ReminingBalance from "@/components/ReminingBalance";
import TableBank from "@/components/TableBank";
import React from "react";



export default function DataTransfer() {
    return(
        <div className="pt-2">
            <div className="flex justify-between m-2 p-2">
                <ReminingBalance />
                <MutasiHarian />
            </div>
            <div className="pt-2">
                <TableBank />
            </div>
        </div>
    )
}