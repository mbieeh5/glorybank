import { signOut } from "firebase/auth";
import { NextResponse } from "next/server";
import { auth } from "../../../../firebase-config";

export async function POST() {
    try {
        const response =  NextResponse.json(
            { message: "OK" }, 
            { status: 200 }
          );
         response.cookies.delete('authToken')
        await signOut(auth);
        return response;
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }

}