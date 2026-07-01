"use client";

interface ExamResultProps {
    score: number;
    feedback: string;
    onRestart: () => void;
    photoBase64?: string | null;
}

export default function ExamResult({
    score,
    feedback,
    onRestart,
    photoBase64,
}: ExamResultProps) {
    return (
        <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl z-10 animate-fadeIn">
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                            Imtihon yakunlandi
                        </span>
                        <h2 className="text-xl font-semibold mt-1 text-slate-200">
                            Umumiy Natija
                        </h2>
                    </div>
                    <span
                        className={`text-3xl font-mono font-bold ${
                            score >= 60 ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                        {score} / 100
                    </span>
                </div>

                {photoBase64 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                                Sizning rasmingiz
                            </span>
                            <span className="text-xs text-emerald-300">
                                😊 Kulib turdingiz
                            </span>
                        </div>
                        <img
                            src={photoBase64}
                            alt="Talabaning yakuniy rasmi"
                            className="w-full rounded-xl border border-slate-700 object-cover"
                        />
                    </div>
                )}

                <div>
                    <span className="text-xs font-mono text-slate-500 uppercase block mb-1">
                        Professor Xulosasi va Tavsiyalari
                    </span>
                    <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/50 whitespace-pre-wrap">
                        {feedback}
                    </p>
                </div>

                <button
                    onClick={onRestart}
                    className="w-full border border-slate-800 hover:bg-slate-800 text-slate-400 py-3 rounded-xl transition-colors text-sm font-medium"
                >
                    Yangi imtihon topshirish
                </button>
            </div>
        </div>
    );
}
