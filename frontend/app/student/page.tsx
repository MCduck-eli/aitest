'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function StudentLoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [trainingCenters, setTrainingCenters] = useState<any[]>([]);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        full_name: '',
        training_center_id: '',
        subject_id: '',
        group_id: '',
    });

    useEffect(() => {
        const fetchTrainingCenters = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/auth/training-centers`);
                const data = await response.json();
                if (data.success) {
                    setTrainingCenters(data.data);
                }
            } catch (error) {
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
            const subjectsResponse = await fetch(`${API_BASE_URL}/api/v1/auth/training-centers/${formData.training_center_id}/subjects`);
            const subjectsData = await subjectsResponse.json();
            if (subjectsData.success) {
                setSubjects(subjectsData.data);
            }

            // Fetch all groups for all subjects
            const allGroups = [];
            for (const subject of subjectsData.data) {
                const groupsResponse = await fetch(`${API_BASE_URL}/api/v1/auth/subjects/${subject.id}/groups`);
                const groupsData = await groupsResponse.json();
                if (groupsData.success) {
                    allGroups.push(...groupsData.data);
                }
            }
            setGroups(allGroups);
        } catch (error) {
        } finally {
            setLoadingSubjects(false);
            setLoadingGroups(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/student-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Kirish amalga oshmadi');
                return;
            }

            setAuth(data.data.token, data.data.user);
            router.push('/exam');
        } catch (err) {
            setError('Xatolik yuz berdi. Iltimos, yana urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
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

            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-8 text-white">
                    <h1 className="text-3xl font-bold text-center text-slate-100 mb-2">
                        O'quvchi kirish
                    </h1>
                    <p className="text-center text-slate-400 mb-6">
                        Imtihon topshirish uchun kirishingiz kerak
                    </p>

                    {error && (
                        <div className="bg-red-950/40 border border-red-900/60 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {currentStep === 1 && (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        To'liq ismingiz
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
                                        placeholder="Ism Familiya"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={!formData.full_name.trim()}
                                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                                >
                                    Davom etish
                                </button>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        O'quv markazi
                                    </label>
                                    <select
                                        name="training_center_id"
                                        value={formData.training_center_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-200 focus:outline-none"
                                        required
                                        disabled={loadingCenters}
                                    >
                                        <option value="" className="bg-slate-900">
                                            {loadingCenters ? 'Yuklanmoqda...' : 'Markaz tanlang'}
                                        </option>
                                        {trainingCenters.map((center) => (
                                            <option key={center.id} value={center.id} className="bg-slate-900">
                                                {center.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2 px-4 rounded-lg transition"
                                    >
                                        Orqaga
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={!formData.training_center_id}
                                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                                    >
                                        Davom etish
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Fan va Guruh
                                    </label>
                                    {loadingSubjects ? (
                                        <div className="text-slate-400 text-sm">Yuklanmoqda...</div>
                                    ) : subjects.length === 0 ? (
                                        <div className="text-slate-400 text-sm">Bu markazda fanlar yo'q</div>
                                    ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-800 rounded-lg p-3 bg-slate-950/50">
                                            {subjects.map((subject) => {
                                                const subjectGroups = groups.filter(g => g.subject_id === subject.id);
                                                return (
                                                    <div key={subject.id} className="p-2.5 bg-slate-900/40 rounded border border-slate-800/60 mb-2">
                                                        <div className="font-medium text-slate-300 mb-1">{subject.name}</div>
                                                        {subjectGroups.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {subjectGroups.map((group) => (
                                                                    <button
                                                                        key={group.id}
                                                                        type="button"
                                                                        onClick={() => setFormData(prev => ({
                                                                            ...prev,
                                                                            subject_id: subject.id,
                                                                            group_id: group.id
                                                                        }))}
                                                                        className={`px-2 py-1 text-xs rounded transition-all ${
                                                                            formData.subject_id === subject.id && formData.group_id === group.id
                                                                                ? 'bg-green-600 text-white font-medium shadow-md shadow-green-900/30'
                                                                                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                                                                        }`}
                                                                    >
                                                                        {group.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-slate-500">Guruhlar bog'lanmagan</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2 px-4 rounded-lg transition"
                                    >
                                        Orqaga
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !formData.subject_id || !formData.group_id}
                                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                                    >
                                        {loading ? 'Yuklanmoqda...' : 'Kirish'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
