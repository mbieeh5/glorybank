import { jwtVerify } from "jose";
import {  NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "./types/main";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
async function validateToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify<JWTPayload>(
            token,
            SECRET_KEY,
            { algorithms: ['HS256'] }
        );
        if (!payload.token) {
            return null;
        }
        return payload;
    } catch (error) {
        console.error('Token Validation error', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const currentPath = request.nextUrl.pathname;

    const protectedRoute = [
        '/',
        '/data-transfer',
        '/struk-transfer',
        '/admin-section',
    ];

    const isProtectedRoute = protectedRoute.some(route => currentPath.startsWith(route));
    const sessionCookie1 = request.cookies.get('authToken')?.value;

    if (isProtectedRoute && !sessionCookie1) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (sessionCookie1) {
        try {
            const validatedPayload = await validateToken(sessionCookie1);
            if (!validatedPayload) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('authToken');
                return response;
            }

        } catch (error) {
            console.error('unexpected validation error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/data-transfer/:path*',
        '/struk-transfer/:path*',
        '/admin-section/:path*',
    ]
};