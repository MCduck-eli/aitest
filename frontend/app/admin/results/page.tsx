'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function AdminResultsPage() {
    const { token } = useAuthStore();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/admin/results`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setResults(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [token]);

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Talabalar Natijalari (AI Imtihon)</h1>
                    <p className="text-gray-400 mt-1">Oxirgi 24 soat ichida topshirilgan test natijalari</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : results.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-medium text-white mb-2">Hozircha natijalar yo'q</h3>
                    <p className="text-gray-400">Oxirgi 24 soat ichida hech qanday talaba test topshirmagan.</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800 border-b border-slate-700 text-slate-300 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Talaba Ismi</th>
                                    <th className="p-4 font-semibold text-center">Ball</th>
                                    <th className="p-4 font-semibold text-center">Holat</th>
                                    <th className="p-4 font-semibold text-center">Qoidabuzarlik</th>
                                    <th className="p-4 font-semibold">Professor Xulosasi</th>
                                    <th className="p-4 font-semibold text-right">Topshirilgan Vaqt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {results.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {item.photo_base64 ? (
                                                    <img 
                                                        src={item.photo_base64} 
                                                        alt="Student" 
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-600"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                                        {item.student_name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-white">{item.student_name}</div>
                                                    {item.student_email && <div className="text-xs text-slate-400">{item.student_email}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-lg text-white">{item.score}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {item.passed ? (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">O'tdi</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">Yiqildi</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-medium ${item.violation_count > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                                {item.violation_count} marta
                                            </span>
                                            {item.has_suspicious_activity && (
                                                <div className="text-[10px] text-red-500 mt-1 uppercase font-bold tracking-wider">Shubhali</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-300 line-clamp-2" title={item.ai_feedback}>
                                                {item.ai_feedback || "Xulosa yo'q"}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="text-sm text-slate-300">
                                                {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(item.created_at).toLocaleTimeString('uz-UZ')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
