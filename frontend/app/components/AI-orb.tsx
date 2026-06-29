"use client";

interface AIOrbProps {
    loading: boolean;
}

export default function AIOrb({ loading }: AIOrbProps) {
    return (
        <div className="relative flex items-center justify-center mb-12">
            <div
                className={`absolute w-44 h-44 rounded-full bg-cyan-500/20 blur-xl animate-ping transition-all ${
                    loading ? "duration-300 bg-purple-500/30" : ""
                }`}
            ></div>
            <div
                className={`absolute w-36 h-36 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin [animation-duration:10s] transition-colors ${
                    loading ? "border-purple-400" : ""
                }`}
            ></div>
            <div
                className={`w-28 h-28 rounded-full bg-linear-to-tr ${
                    loading
                        ? "from-purple-600 to-indigo-500 shadow-purple-500/50"
                        : "from-cyan-600 to-blue-500 shadow-cyan-500/50"
                } flex items-center justify-center shadow-2xl transition-all duration-500 z-10`}
            >
                {loading ? (
                    <span className="text-xs font-mono tracking-widest text-purple-200 animate-pulse">
                        ANALYZING
                    </span>
                ) : (
                    <span className="text-xl font-bold tracking-wider text-cyan-100">
                        AI
                    </span>
                )}
            </div>
        </div>
    );
}
