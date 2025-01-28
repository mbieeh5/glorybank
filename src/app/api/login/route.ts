import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const MAX_AGE = 60 * 60 * 24 * 1; // 1 day
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = sign(body, JWT_SECRET, { expiresIn: MAX_AGE });
        const response = NextResponse.json(
            { message: "OK" },
            { status: 200 }
        );

        response.cookies.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: MAX_AGE,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}