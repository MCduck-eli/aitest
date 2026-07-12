"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/student");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Yuklanmoqda...</p>
            </div>
        </div>
    );
}
