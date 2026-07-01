'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function AdminDashboard() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [createForm, setCreateForm] = useState({
        full_name: '',
        role: 'teacher',
        subject: '',
        study_group: '',
        lesson_script: '',
    });
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [createMessage, setCreateMessage] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/results/dashboard/analytics`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch analytics');
                }

                const data = await response.json();
                setAnalytics(data.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [token, router]);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingAdmin(true);
        setCreateMessage('');
        setCreatedCredentials(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(createForm),
            });

            const data = await response.json();

            if (!response.ok) {
                setCreateMessage(data.error || 'Yangi admin yaratilmadi');
                return;
            }

            setCreatedCredentials(data.data?.generated_credentials || null);
            setCreateMessage(data.message || 'Admin yaratildi');
            setCreateForm({ full_name: '', role: 'teacher', subject: '', study_group: '', lesson_script: '' });
        } catch (error) {
            setCreateMessage('Yangi admin yaratishda xatolik yuz berdi');
        } finally {
            setCreatingAdmin(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Asosiy panel</h1>

            {user?.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Yangi admin/teacher yaratish</h2>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To‘liq ism</label>
                            <input
                                type="text"
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                                value={createForm.role}
                                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'admin' | 'teacher' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                            >
                                <option value="teacher">O‘qituvchi (Teacher)</option>
                                <option value="admin">Administrator (Admin)</option>
                            </select>
                        </div>

                        {createForm.role === 'teacher' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fan nomi</label>
                                        <input
                                            type="text"
                                            value={createForm.subject}
                                            onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                                            placeholder="Masalan: Ingliz tili"
                                            required={createForm.role === 'teacher'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Guruh nomi</label>
                                        <input
                                            type="text"
                                            value={createForm.study_group}
                                            onChange={(e) => setCreateForm({ ...createForm, study_group: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                                            placeholder="Masalan: Group-101"
                                            required={createForm.role === 'teacher'}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dars skripti (AI savollar yaratishi uchun)</label>
                                    <textarea
                                        value={createForm.lesson_script}
                                        onChange={(e) => setCreateForm({ ...createForm, lesson_script: e.target.value })}
                                        className="w-full min-h-40 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                                        placeholder="Dars matni, mavzular yoki tushuntirishlarni kiriting..."
                                        required={createForm.role === 'teacher'}
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={creatingAdmin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {creatingAdmin ? 'AI ishlamoqda va hisob yaratilmoqda...' : 'Admin/Teacher yaratish'}
                        </button>
                    </form>

                    {createMessage && (
                        <div className={`mt-4 px-4 py-3 rounded-lg border ${createMessage.includes('muvaffaqiyatli') || createMessage.includes('Admin yaratildi') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {createMessage}
                        </div>
                    )}

                    {createdCredentials && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-4 rounded-lg">
                            <p className="font-bold mb-3 flex items-center gap-2">
                                <span>🔑</span> Avtomatik yaratilgan login va parol:
                            </p>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="bg-white/50 p-2 rounded border border-blue-100"><span className="font-bold text-gray-600">Login (Email):</span> {createdCredentials.email}</div>
                                <div className="bg-white/50 p-2 rounded border border-blue-100"><span className="font-bold text-gray-600">Parol:</span> {createdCredentials.password}</div>
                            </div>
                            <p className="mt-3 text-xs text-blue-600 italic">* Ushbu ma'lumotlarni nusxalab oling, ular boshqa ko'rsatilmaydi.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AnalyticsCard
                    title="Jami testlar"
                    value={analytics?.total_tests || 0}
                    icon="📝"
                    color="bg-blue-500"
                />
                <AnalyticsCard
                    title="Jami o\'quvchilar"
                    value={analytics?.total_students || 0}
                    icon="👥"
                    color="bg-green-500"
                />
                <AnalyticsCard
                    title="Topshirilgan imtihonlar"
                    value={analytics?.total_exams || 0}
                    icon="✅"
                    color="bg-purple-500"
                />
                <AnalyticsCard
                    title="O\'tish foizi"
                    value={`${analytics?.pass_rate || 0}%`}
                    icon="📈"
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Exams */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Yaqinda topshirilgan imtihonlar</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    O\'quvchi
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Test
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Holat
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Sana
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics?.recent_exams?.map((exam: any) => (
                                <tr key={exam.id} className="border-t hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-900">
                                        {exam.student_name}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-900">
                                        {exam.title}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-900">
                                        {exam.score}%
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <span
                                            className={`px-3 py-1 rounded text-white text-xs font-medium ${
                                                exam.passed
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                            }`}
                                        >
                                            {exam.passed ? 'O\'tdi' : 'O\'tmadi'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-900">
                                        {new Date(exam.submitted_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function AnalyticsCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}) {
    return (
        <div className={`${color} rounded-lg shadow p-6 text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-100 text-sm">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <span className="text-5xl opacity-20">{icon}</span>
            </div>
        </div>
    );
}
