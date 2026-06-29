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

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/results/dashboard/analytics`, {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AnalyticsCard
                    title="Total Tests"
                    value={analytics?.total_tests || 0}
                    icon="📝"
                    color="bg-blue-500"
                />
                <AnalyticsCard
                    title="Total Students"
                    value={analytics?.total_students || 0}
                    icon="👥"
                    color="bg-green-500"
                />
                <AnalyticsCard
                    title="Exams Taken"
                    value={analytics?.total_exams || 0}
                    icon="✅"
                    color="bg-purple-500"
                />
                <AnalyticsCard
                    title="Pass Rate"
                    value={`${analytics?.pass_rate || 0}%`}
                    icon="📈"
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Exams */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Exams</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Test
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                    Date
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
                                            {exam.passed ? 'Passed' : 'Failed'}
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
