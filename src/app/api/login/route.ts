import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const MAX_AGE = 60 * 60 * 24 * 1
        const JWT_SECRET = process.env.JWT_SECRET || '';
        const response =  NextResponse.json(
            { message: "OK" }, 
            { status: 200 }
          );

        const Token = sign(body, JWT_SECRET, {expiresIn: MAX_AGE});
        response.cookies.set('authToken', Token)
        return response;
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {message: "Internal Server Error"},
            {status: 500},
        );
    }

}