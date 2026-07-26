"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LessonSelector from "../components/lesson-selector";
import QuestionCard from "../components/question-card";
import ExamResult from "../components/exam-result";
import AIOrb from "../components/AI-orb";
import { API_BASE_URL } from "../../lib/api";
import { useAuthStore } from "../../lib/auth";

export default function ExamPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"select" | "exam" | "result">("select");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [questions, setQuestions] = useState<any[]>([]);
    const [currentLesson, setCurrentLesson] = useState<string>("");
    const [aiResult, setAiResult] = useState<{
        score: number;
        feedback: string;
        photoBase64?: string | null;
    } | null>(null);

    const handleStartExam = async (
        lessonId: string,
        selectedTopic?: string,
    ) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/tests/start-exam`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        lessonScriptId: lessonId,
                        selectedTopic: selectedTopic,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setQuestions(data.questions || []);
                setCurrentLesson(lessonId);
                setStep("exam");
            } else {
                alert(
                    `Xatolik: ${data.message || "Server ma'lumotni qaytarmadi"}`,
                );
            }
        } catch (error) {
            alert("Backendga ulanib bo'lmadi!");
        } finally {
            setLoading(false);
        }
    };

    const handleFinishExam = async (
        examHistory: Array<{ question: string; answer: string }>,
        photoBase64: string | null,
        violationCount: number = 0,
    ) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/tests/submit-full-exam`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentName: user?.full_name || "Student",
                        examHistory,
                        photoBase64,
                        violationCount,
                    }),
                },
            );
            const data = await response.json();

            if (response.ok && data.success) {
                const evalData = data.evaluation || {};

                setAiResult({
                    score: Number(evalData.finalScore) || 0,
                    feedback:
                        evalData.overallFeedback || "Baholash yakunlandi.",
                    photoBase64: photoBase64 ?? null,
                });
                setStep("result");
            } else {
                alert(
                    "Natijani saqlashda xatolik: " +
                        (data.message || "Noma'lum xato"),
                );
            }
        } catch (error) {
            alert("Serverga ulanishda xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    const handleForceFail = async (
        reason: string,
        photoBase64: string | null,
    ) => {
        setLoading(true);
        try {
            await fetch(`${API_BASE_URL}/api/v1/tests/report-fail`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: user?.full_name || "Student",
                    reason: `🚫 IMTIHON MUZLATILDI: ${reason}`,
                    photoBase64,
                }),
            });
            setAiResult({
                score: 0,
                feedback: `Qoidabuzarlik: ${reason}`,
                photoBase64: photoBase64 ?? null,
            });
            setStep("result");
        } catch (error) {
            alert("Xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/student");
    };

    const handleRestart = () => {
        setQuestions([]);
        setAiResult(null);
        setStep("select");
    };

    return (
        <div className="w-full min-h-screen text-white relative flex flex-col justify-start p-4 md:p-8 overflow-y-auto">
            <div className="w-full max-w-6xl mx-auto p-4 flex justify-between items-center z-20 relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-0.5 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-cyan-400">
                            {mounted ? user?.full_name?.charAt(0) || "S" : "S"}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium text-slate-100">
                            {mounted ? user?.full_name || "Student" : "Student"}
                        </div>
                        <div className="text-xs text-slate-400">
                            {mounted
                                ? `${user?.subject || ""} - ${user?.study_group || ""}`
                                : ""}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all border border-red-500/30 text-sm font-medium shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-[0.98]"
                >
                    Chiqish
                </button>
            </div>

            <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-start p-4 relative z-20 my-6">
                <AIOrb loading={loading} />
                {step === "select" && (
                    <LessonSelector
                        onStartExam={handleStartExam}
                        loading={loading}
                    />
                )}
                {step === "exam" && (
                    <QuestionCard
                        questions={questions}
                        currentLesson={currentLesson}
                        onFinishExam={handleFinishExam}
                        onForceFail={handleForceFail}
                    />
                )}
                {step === "result" && aiResult && (
                    <ExamResult
                        score={aiResult.score}
                        feedback={aiResult.feedback}
                        onRestart={handleRestart}
                        photoBase64={aiResult.photoBase64 ?? null}
                    />
                )}
            </div>
        </div>
    );
}
