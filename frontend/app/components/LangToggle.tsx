"use client";

import { useLangStore, Language } from "@/store/langStore";
import { useEffect, useState } from "react";

export function LangToggle() {
    const { lang, setLang } = useLangStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const toggleLang = () => {
        setLang(lang === "uz" ? "ru" : "uz");
    };

    return (
        <div className="fixed top-6 right-6 md:top-10 md:right-10 z-[100]">
            <button
                onClick={toggleLang}
                className="flex items-center justify-between w-16 h-8 p-1 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-full cursor-pointer hover:bg-slate-800/80 transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] relative overflow-hidden"
            >
                <div
                    className={`absolute top-1 left-1 bottom-1 w-7 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-transform duration-300 ease-in-out shadow-md ${
                        lang === "ru" ? "translate-x-7" : "translate-x-0"
                    }`}
                />
                <span
                    className={`text-[10px] font-bold z-10 w-7 text-center transition-colors duration-300 ${
                        lang === "uz" ? "text-white" : "text-slate-400"
                    }`}
                >
                    UZ
                </span>
                <span
                    className={`text-[10px] font-bold z-10 w-7 text-center transition-colors duration-300 ${
                        lang === "ru" ? "text-white" : "text-slate-400"
                    }`}
                >
                    RU
                </span>
            </button>
        </div>
    );
}
