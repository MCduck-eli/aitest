"use client";

import { motion } from "framer-motion";

interface StudentLoginFormProps {
    currentStep: number;
    formData: {
        full_name: string;
        training_center_id: string;
        subject_id: string;
        group_id: string;
    };
    handleInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    handleNextStep: () => void;
    handlePrevStep: () => void;
    handleLogin: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    trainingCenters: any[];
    loadingCenters: boolean;
    subjects: any[];
    loadingSubjects: boolean;
    groups: any[];
    loadingGroups: boolean;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function StudentLoginForm({
    currentStep,
    formData,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    handleLogin,
    loading,
    error,
    trainingCenters,
    loadingCenters,
    subjects,
    loadingSubjects,
    groups,
    loadingGroups,
    setFormData,
}: StudentLoginFormProps) {
    const stepVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
    };

    return (
        <div className="md:w-3/5 p-6 relative flex flex-col justify-between h-full overflow-hidden">
            <div>
                <h1 className="text-2xl font-bold text-slate-100 mb-4 bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400">
                    {currentStep === 1
                        ? "Shaxsiy Ma'lumotlar"
                        : currentStep === 2
                          ? "Markazni Tanlang"
                          : "Guruhni Tasdiqlang"}
                </h1>

                {error && (
                    <div className="bg-red-950/40 border border-red-900/60 text-red-400 px-4 py-2 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="relative">
                    {currentStep === 1 && (
                        <motion.div
                            // @ts-ignore
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full"
                        >
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    To'liq ismingiz
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                                    placeholder="Masalan: Aliyev Vali"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                disabled={!formData.full_name.trim()}
                                className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:shadow-none active:scale-[0.98]"
                            >
                                Keyingi qadam
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            // @ts-ignore
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full"
                        >
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    O'quv markazi
                                </label>
                                <select
                                    name="training_center_id"
                                    value={formData.training_center_id}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-slate-200 focus:outline-none transition-all shadow-inner"
                                    required
                                    disabled={loadingCenters}
                                >
                                    <option value="" className="bg-slate-900">
                                        {loadingCenters
                                            ? "Yuklanmoqda..."
                                            : "Markaz tanlang"}
                                    </option>
                                    {trainingCenters.map((center) => (
                                        <option
                                            key={center.id}
                                            value={center.id}
                                            className="bg-slate-900"
                                        >
                                            {center.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
                                >
                                    Orqaga
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={!formData.training_center_id}
                                    className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:shadow-none active:scale-[0.98]"
                                >
                                    Davom etish
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            // @ts-ignore
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="w-full"
                        >
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Fan va Guruh
                                </label>
                                {loadingSubjects || loadingGroups ? (
                                    <div className="text-slate-400 text-sm p-4 bg-slate-900/50 rounded-xl">
                                        Yuklanmoqda...
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div className="text-slate-400 text-sm p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                        Bu markazda fanlar yo'q
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-36 overflow-y-auto border border-slate-700/50 rounded-xl p-3 bg-slate-950/40 shadow-inner custom-scrollbar">
                                        {subjects.map((subject) => {
                                            const subjectGroups = groups.filter(
                                                (g) =>
                                                    g.subject_id === subject.id,
                                            );
                                            return (
                                                <div
                                                    key={subject.id}
                                                    className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50"
                                                >
                                                    <div className="font-semibold text-purple-300 mb-1.5 text-xs">
                                                        {subject.name}
                                                    </div>
                                                    {subjectGroups.length >
                                                    0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {subjectGroups.map(
                                                                (group) => (
                                                                    <button
                                                                        key={
                                                                            group.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setFormData(
                                                                                (
                                                                                    prev: any,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    subject_id:
                                                                                        subject.id,
                                                                                    group_id:
                                                                                        group.id,
                                                                                }),
                                                                            )
                                                                        }
                                                                        className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                                                                            formData.subject_id ===
                                                                                subject.id &&
                                                                            formData.group_id ===
                                                                                group.id
                                                                                ? "bg-linear-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                                                                : "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            group.name
                                                                        }
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-slate-500">
                                                            Guruhlar mavjud emas
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] text-sm"
                                >
                                    Orqaga
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !formData.subject_id ||
                                        !formData.group_id
                                    }
                                    className="flex-1 bg-linear-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:shadow-none active:scale-[0.98] text-sm"
                                >
                                    {loading
                                        ? "Kirilmoqda..."
                                        : "Tizimga Kirish"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>
            </div>
        </div>
    );
}
