"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const timeout = setTimeout(() => {
            router.push('/');
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="text-2xl text-gray-600 mt-4">Page Not Found</p>
                <p className="text-xl text-gray-600 mt-4">Redirecting in {countdown}...</p>
                <button 
                    onClick={() => router.push('/')} 
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}