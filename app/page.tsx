"use client";

import { useState } from "react";
import LessonSelector from "./components/lesson-selector";
import QuestionCard from "./components/question-card";
import ExamResult from "./components/exam-result";
import AIOrb from "./components/AI-orb";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5500";

export default function AIPage() {
    const [studentName] = useState("Eldor Abdukhalikov");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"select" | "exam" | "result">("select");

    const [questions, setQuestions] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(1);
    const [aiResult, setAiResult] = useState<{
        score: number;
        feedback: string;
    } | null>(null);

    const handleStartExam = async (lessonId: number) => {
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
                        lessonId,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setQuestions(data.questions || []);
                setCurrentLesson(data.currentLesson || lessonId);
                setStep("exam");
            } else {
                alert(
                    `Xatolik: ${data.message || "Server ma'lumotni qaytarmadi"}`,
                );
            }
        } catch (error) {
            console.error("❌ Fetch xatosi:", error);
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
                        studentName,
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
                });
                setStep("result");
            } else {
                alert(
                    "Natijani saqlashda xatolik: " +
                        (data.message || "Noma'lum xato"),
                );
            }
        } catch (error) {
            console.error("Imtihon topshirishda xato:", error);
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
                    studentName,
                    reason: `🚫 IMTIHON MUZLATILDI: ${reason}`,
                    photoBase64,
                }),
            });
            setAiResult({
                score: 0,
                feedback: `Qoidabuzarlik: ${reason}`,
            });
            setStep("result");
        } catch (error) {
            console.error("Force fail xatosi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = () => {
        setQuestions([]);
        setAiResult(null);
        setStep("select");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
                />
            )}
        </div>
    );
}
