"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../lib/api";
import { useAuthStore } from "../../lib/auth";
import { useLangStore } from "@/store/langStore";
import { getTranslation } from "@/lib/i18n";

interface Topic {
    id: number;
    name: string;
    description?: string;
}

interface LessonScript {
    id: string;
    subject_name?: string;
    group_name?: string;
    title?: string;
    content: string;
    topics?: Topic[];
}

interface LessonSelectorProps {
    onStartExam: (lessonId: string, selectedTopic?: string) => void;
    loading: boolean;
}

export default function LessonSelector({
    onStartExam,
    loading,
}: LessonSelectorProps) {
    const { token } = useAuthStore();
    const { lang } = useLangStore();
    const [lessonScripts, setLessonScripts] = useState<LessonScript[]>([]);
    const [selectedScript, setSelectedScript] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showRules, setShowRules] = useState(false);
    const [acceptedRules, setAcceptedRules] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchLessonScripts = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/admin/lesson-scripts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (!isMounted) return;

                if (data.success && Array.isArray(data.data)) {
                    setLessonScripts(data.data);
                    if (data.data.length > 0) {
                        setSelectedScript(data.data[0].id);
                    }
                } else {
                    setFetchError(getTranslation(lang, 'ls_no_script'));
                }
            } catch (error) {
                if (isMounted) {
                    setFetchError(getTranslation(lang, 'ls_error_conn'));
                }
            }
        };

        fetchLessonScripts();

        return () => {
            isMounted = false;
        };
    }, [token]);

    // Reset selected topic when script changes
    useEffect(() => {
        setSelectedTopic("");
    }, [selectedScript]);

    const handleStartExam = () => {
        if (selectedScript) {
            setAcceptedRules(false);
            setShowRules(true);
        }
    };

    const handleConfirmStart = () => {
        if (acceptedRules && selectedScript) {
            setShowRules(false);
            onStartExam(selectedScript, selectedTopic);
        }
    };

    const currentScriptObj = lessonScripts.find((s) => s.id === selectedScript);
    const hasTopics = currentScriptObj && Array.isArray(currentScriptObj.topics) && currentScriptObj.topics.length > 0;

    return (
        <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-xl z-10 animate-fadeIn">
            <div className="mb-6">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                    {getTranslation(lang, 'ls_title')}
                </span>
                <h2 className="text-xl font-semibold mt-1 text-slate-200">
                    {getTranslation(lang, 'ls_subtitle')}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    {getTranslation(lang, 'ls_desc')}
                </p>
            </div>

            <div className="space-y-4">
                {fetchError ? (
                    <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                        {fetchError}
                    </div>
                ) : lessonScripts.length === 0 ? (
                    <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-400 text-center">
                        {getTranslation(lang, 'ls_loading')}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <select
                            value={selectedScript}
                            onChange={(e) => setSelectedScript(e.target.value)}
                            disabled={loading}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {lessonScripts.map((script) => (
                                <option key={script.id} value={script.id}>
                                    {script.subject_name ? `${script.subject_name} uchun dars scripti` : 'Umumiy dars scripti'}
                                    {script.group_name && ` (${script.group_name})`}
                                </option>
                            ))}
                        </select>

                        {hasTopics && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">
                                    {getTranslation(lang, 'ls_topic_label')}
                                </label>
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">{getTranslation(lang, 'ls_all_topics')}</option>
                                    {currentScriptObj.topics?.map((topic) => (
                                        <option key={topic.id} value={topic.name}>
                                            {topic.name} {topic.description ? `- ${topic.description}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {!hasTopics && currentScriptObj?.content && (
                            <div className="space-y-2 mt-4">
                                <label className="block text-sm font-medium text-slate-300">
                                    {getTranslation(lang, 'ls_topic_label') || "Qaysi mavzugacha keldingiz?"}
                                </label>
                                <select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    disabled={loading}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">{getTranslation(lang, 'ls_all_topics')}</option>
                                    {currentScriptObj.content
                                        .split('\n')
                                        .map(line => line.replace(/[*_#`]/g, '').trim()) // markdown belgilarni tozalash
                                        .filter(line => line.length > 3) // juda qisqa qatorlarni olib tashlash
                                        .map((line, idx) => (
                                            <option key={idx} value={line}>
                                                {line}
                                            </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={handleStartExam}
                    disabled={loading || !selectedScript}
                    className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg active:scale-[0.99]"
                >
                    {loading
                        ? getTranslation(lang, 'ls_start_loading')
                        : getTranslation(lang, 'ls_start_btn')}
                </button>
            </div>

            {showRules && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
                    <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                        <div className="mb-4">
                            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                                {getTranslation(lang, 'ls_rule_title')}
                            </span>
                            <h3 className="text-xl font-semibold mt-1 text-slate-100">
                                {getTranslation(lang, 'ls_rule_subtitle')}
                            </h3>
                        </div>

                        <ul className="space-y-3 text-sm text-slate-300 mb-5">
                            <li className="flex gap-3">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{getTranslation(lang, 'ls_rule_1')}</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{getTranslation(lang, 'ls_rule_2')}</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{getTranslation(lang, 'ls_rule_3')}</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{getTranslation(lang, 'ls_rule_4')}</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{getTranslation(lang, 'ls_rule_5')}</span>
                            </li>
                        </ul>

                        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40 mb-5">
                            <input
                                type="checkbox"
                                checked={acceptedRules}
                                onChange={(e) => setAcceptedRules(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span className="text-sm text-slate-300">
                                {getTranslation(lang, 'ls_rule_accept')}
                            </span>
                        </label>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRules(false)}
                                className="flex-1 border border-slate-700 text-slate-300 py-2.5 rounded-xl hover:bg-slate-800"
                            >
                                {getTranslation(lang, 'ls_rule_cancel')}
                            </button>
                            <button
                                onClick={handleConfirmStart}
                                disabled={!acceptedRules}
                                className="flex-1 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-medium py-2.5 rounded-xl transition-all"
                            >
                                {getTranslation(lang, 'ls_rule_start')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
