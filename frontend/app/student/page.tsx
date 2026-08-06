"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api";
import StudentLoginForm from "./components/student-login-form";
import { useLangStore } from "@/store/langStore";
import { getTranslation } from "@/lib/i18n";

export default function StudentLoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const { lang } = useLangStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [trainingCenters, setTrainingCenters] = useState<any[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        full_name: "",
        training_center_id: "",
        subject_id: "",
        group_id: "",
    });

    useEffect(() => {
        const fetchTrainingCenters = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/v1/auth/training-centers`,
                );
                const data = await response.json();
                if (data.success) {
                    setTrainingCenters(data.data);
                }
            } catch (err) {
            } finally {
                setLoadingCenters(false);
            }
        };

        fetchTrainingCenters();
    }, []);

    useEffect(() => {
        if (formData.training_center_id) {
            fetchSubjectsAndGroups();
        }
    }, [formData.training_center_id]);

    const fetchSubjectsAndGroups = async () => {
        setLoadingSubjects(true);
        setLoadingGroups(true);
        try {
            const subjectsResponse = await fetch(
                `${API_BASE_URL}/api/v1/auth/training-centers/${formData.training_center_id}/subjects`,
            );
            const subjectsData = await subjectsResponse.json();
            if (subjectsData.success) {
                setSubjects(subjectsData.data);

                const allGroups = [];
                for (const subject of subjectsData.data) {
                    const groupsResponse = await fetch(
                        `${API_BASE_URL}/api/v1/auth/subjects/${subject.id}/groups`,
                    );
                    const groupsData = await groupsResponse.json();
                    if (groupsData.success) {
                        allGroups.push(...groupsData.data);
                    }
                }
                setGroups(allGroups);
            }
        } catch (err) {
        } finally {
            setLoadingSubjects(false);
            setLoadingGroups(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => setCurrentStep((prev) => prev + 1);
    const handlePrevStep = () => setCurrentStep((prev) => prev - 1);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/auth/student-login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || getTranslation(lang, 'error_login_failed'));
                return;
            }

            setAuth(data.data.token, data.data.user);
            router.push("/exam");
        } catch (err) {
            setError(getTranslation(lang, 'error_generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen text-white relative flex items-center justify-center p-4 md:p-12 overflow-y-auto">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-6xl relative z-20 pointer-events-auto">
                <div className="hidden lg:block w-1/3 h-[420px] bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden relative shrink-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity duration-700"
                    >
                        <source src="/space.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col md:flex-row overflow-hidden relative">
                    <div className="md:w-2/5 bg-gradient-to-br from-purple-900/40 to-slate-900/80 p-8 flex flex-col items-center justify-center border-r border-slate-700/30">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-1 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                <svg
                                    className="w-16 h-16 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 font-orbitron text-center">
                            {getTranslation(lang, 'student_profile')}
                        </h2>
                        <p className="text-slate-400 text-center text-sm">
                            Platformaga kirish va imtihonni boshlash uchun
                            ma'lumotlaringizni kiriting.
                        </p>

                        <div className="mt-8 flex gap-2">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        currentStep === step
                                            ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-125"
                                            : currentStep > step
                                              ? "bg-purple-500"
                                              : "bg-slate-700"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <StudentLoginForm
                        currentStep={currentStep}
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleNextStep={handleNextStep}
                        handlePrevStep={handlePrevStep}
                        handleLogin={handleLogin}
                        loading={loading}
                        error={error}
                        trainingCenters={trainingCenters}
                        loadingCenters={loadingCenters}
                        subjects={subjects}
                        loadingSubjects={loadingSubjects}
                        groups={groups}
                        loadingGroups={loadingGroups}
                        setFormData={setFormData}
                    />
                </div>
            </div>
        </div>
    );
}
