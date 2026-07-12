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

    const [questions, setQuestions] = useState([]);
    const [currentLesson, setCurrentLesson] = useState<string>("");
    const [aiResult, setAiResult] = useState<{
        score: number;
        feedback: string;
        photoBase64?: string | null;
    } | null>(null);

    const handleStartExam = async (lessonId: string, selectedTopic?: string) => {
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
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/student');
    };

    const handleRestart = () => {
        setQuestions([]);
        setAiResult(null);
        setStep("select");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative overflow-hidden">
            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-50"></div>
                <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full opacity-30"></div>
                <div className="absolute top-40 left-1/4 w-1 h-1 bg-white rounded-full opacity-40"></div>
                <div className="absolute top-60 right-1/3 w-1 h-1 bg-white rounded-full opacity-60"></div>
                <div className="absolute top-80 left-1/2 w-1 h-1 bg-white rounded-full opacity-20"></div>
                <div className="absolute bottom-20 left-20 w-1 h-1 bg-white rounded-full opacity-50"></div>
                <div className="absolute bottom-40 right-10 w-1 h-1 bg-white rounded-full opacity-40"></div>
                <div className="absolute bottom-60 left-1/3 w-1 h-1 bg-white rounded-full opacity-30"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-50"></div>
                <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-white rounded-full opacity-40"></div>
            </div>

            {/* Header with user info and logout */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold">
                        {mounted ? (user?.full_name?.charAt(0) || 'S') : 'S'}
                    </div>
                    <div>
                        <div className="font-medium">{mounted ? (user?.full_name || 'Student') : 'Student'}</div>
                        <div className="text-xs text-gray-400">{mounted ? (`${user?.subject || ''} - ${user?.study_group || ''}`) : ''}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
                >
                    Chiqish
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 pt-20">
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
