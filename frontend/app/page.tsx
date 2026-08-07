"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLangStore } from "@/store/langStore";
import { getTranslation } from "@/lib/i18n";

export default function HomePage() {
    const router = useRouter();
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const { lang } = useLangStore();

    const handleNavigate = () => {
        router.push("/student");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 150 },
        },
    };

    const backgroundVideo = useMemo(
        () => (
            <>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-screen opacity-90"
                >
                    <source src="/future.webm" type="video/webm" />
                    <source src="/future_compressed.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-slate-950/30 z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-transparent z-0"></div>
            </>
        ),
        [],
    );

    return (
        <main className="relative w-full h-full min-h-screen flex flex-col items-center justify-center font-sans overflow-hidden">
            {backgroundVideo}

            {}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-10"
            >
                <div className="text-3xl font-extrabold tracking-tight text-white font-orbitron drop-shadow-md">
                    AiTest
                </div>
            </motion.div>

            {}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="z-10 text-center px-4 max-w-4xl flex flex-col items-center mt-[10%]"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 leading-tight font-orbitron drop-shadow-xl"
                >
                    {getTranslation(lang, "hero_title")}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        {getTranslation(lang, "hero_title_span")}
                    </span>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-2xl text-slate-100 mb-10 max-w-2xl mx-auto font-light drop-shadow-lg"
                >
                    {getTranslation(lang, "hero_subtitle")}
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    {}
                    <button
                        onClick={handleNavigate}
                        className="group relative px-10 py-4 bg-white/90 backdrop-blur-sm rounded-full font-bold text-lg text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden border border-white/50"
                    >
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="tracking-wide">
                            {getTranslation(lang, "btn_start")}
                        </span>
                        <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </button>

                    {}
                    <button
                        onClick={() => setIsAboutOpen(true)}
                        className="group relative px-10 py-4 bg-slate-900/30 border border-slate-300/30 rounded-full font-bold text-lg text-white backdrop-blur-md hover:bg-slate-900/50 hover:border-slate-300/60 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span className="tracking-wide">
                            {getTranslation(lang, "btn_about")}
                        </span>
                        <svg
                            className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </button>
                </motion.div>
            </motion.div>

            {}
            <AnimatePresence>
                {isAboutOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{
                                type: "tween",
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                            className="relative w-full max-w-2xl bg-slate-900/80 border border-slate-700/50 p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.15)]"
                        >
                            {}
                            <button
                                onClick={() => setIsAboutOpen(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 rounded-full p-2"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                            <h2 className="text-3xl font-bold text-white mb-6 font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                {getTranslation(lang, "about_title")}
                            </h2>

                            <div className="space-y-4 text-slate-300 leading-relaxed font-light">
                                <p>
                                    <strong className="text-white font-medium">
                                        AiTest
                                    </strong>{" "}
                                    {getTranslation(lang, "about_p1")}
                                </p>
                                <p>{getTranslation(lang, "about_p2")}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-900/40 flex items-center justify-center shrink-0 border border-cyan-500/30 text-cyan-400">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">
                                                {getTranslation(
                                                    lang,
                                                    "feature1_title",
                                                )}
                                            </h4>
                                            <p className="text-sm text-slate-400">
                                                {getTranslation(
                                                    lang,
                                                    "feature1_desc",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-900/40 flex items-center justify-center shrink-0 border border-purple-500/30 text-purple-400">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">
                                                {getTranslation(
                                                    lang,
                                                    "feature2_title",
                                                )}
                                            </h4>
                                            <p className="text-sm text-slate-400">
                                                {getTranslation(
                                                    lang,
                                                    "feature2_desc",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
