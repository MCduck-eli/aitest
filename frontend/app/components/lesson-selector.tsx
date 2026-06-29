"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";

interface Lesson {
    id: number;
    name: string;
}

interface SubjectCategory {
    id: string;
    name: string;
    fromLesson: number;
    toLesson: number;
}

interface LessonSelectorProps {
    onStartExam: (lessonId: number) => void;
    loading: boolean;
}

export default function LessonSelector({
    onStartExam,
    loading,
}: LessonSelectorProps) {
    const [syllabus, setSyllabus] = useState<Lesson[]>([]);
    const [categories, setCategories] = useState<SubjectCategory[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<number>(0);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetch(`${API_BASE_URL}/api/v1/tests/syllabus`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!isMounted) return;
                console.log("Backend javobi (Syllabus):", data);
                const lessons =
                    data.data ||
                    data.syllabus ||
                    (Array.isArray(data) ? data : null);

                if (lessons && Array.isArray(lessons)) {
                    setSyllabus(lessons);
                    if (Array.isArray(data.categories)) {
                        setCategories(data.categories);
                    }
                    if (lessons.length > 0) {
                        setSelectedLesson(lessons[0].id);
                    }
                } else {
                    setFetchError(
                        "Darslar ro'yxati topilmadi yoki format noto'g'ri.",
                    );
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("Syllabus yuklash xatosi:", err);
                    setFetchError("Backend bilan bog'lanishda xatolik.");
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl z-10 animate-fadeIn">
            <div className="mb-6">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    Imtihon sozlamalari
                </span>
                <h2 className="text-xl font-semibold mt-1 text-slate-200">
                    Hozirda qaysi darsga kelgansiz?
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    AI tanlangan darsgacha bo&apos;lgan barcha o&apos;tilgan mavzulardan
                    aralash imtihon tayyorlaydi.
                </p>
            </div>

            <div className="space-y-4">
                {fetchError ? (
                    <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                        {fetchError}
                    </div>
                ) : (
                    <select
                        value={selectedLesson}
                        onChange={(e) =>
                            setSelectedLesson(Number(e.target.value))
                        }
                        disabled={loading || syllabus.length === 0}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {syllabus.length === 0 ? (
                            <option value={0}>Darslar yuklanmoqda...</option>
                        ) : categories.length > 0 ? (
                            categories.map((category) => (
                                <optgroup key={category.id} label={category.name}>
                                    {syllabus
                                        .filter(
                                            (lesson) =>
                                                lesson.id >=
                                                    category.fromLesson &&
                                                lesson.id <= category.toLesson,
                                        )
                                        .map((lesson) => (
                                            <option
                                                key={lesson.id}
                                                value={lesson.id}
                                            >
                                                {lesson.name}
                                            </option>
                                        ))}
                                </optgroup>
                            ))
                        ) : (
                            syllabus.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                    {lesson.name}
                                </option>
                            ))
                        )}
                    </select>
                )}

                <button
                    onClick={() =>
                        selectedLesson !== 0 && onStartExam(selectedLesson)
                    }
                    disabled={
                        loading || syllabus.length === 0 || selectedLesson === 0
                    }
                    className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg active:scale-[0.99]"
                >
                    {loading
                        ? "AI Imtihon tayyorlamoqda..."
                        : "Imtihonni boshlash"}
                </button>
            </div>
        </div>
    );
}
