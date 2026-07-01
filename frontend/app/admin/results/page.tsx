'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function ResultsPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [tests, setTests] = useState<any[]>([]);
    const [selectedTest, setSelectedTest] = useState<string>('');
    const [results, setResults] = useState<any[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
            return;
        }

        fetchTests();
    }, [token, router]);

    const fetchTests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/tests`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }

            const data = await response.json();
            setTests(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tests:', error);
            setLoading(false);
        }
    };

    const fetchResults = async (testId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/results/tests/${testId}/results`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            setResults(data.data.results);
            setStatistics(data.data.statistics);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTestSelect = (testId: string) => {
        setSelectedTest(testId);
        fetchResults(testId);
    };

    if (loading && !selectedTest) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Imtihon natijalari</h1>

            {/* Test Selector */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testni tanlang
                </label>
                <select
                    value={selectedTest}
                    onChange={(e) => handleTestSelect(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Test tanlang --</option>
                    {tests.map((test) => (
                        <option key={test.id} value={test.id}>
                            {test.title} ({test.total_questions} questions)
                        </option>
                    ))}
                </select>
            </div>

            {selectedTest && (
                <>
                    {/* Statistics Cards */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Jami urinishlar"
                                value={statistics.total_attempts}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="O\'tdi"
                                value={statistics.passed_count}
                                color="bg-green-500"
                            />
                            <StatCard
                                title="O\'tmadi"
                                value={statistics.failed_count}
                                color="bg-red-500"
                            />
                            <StatCard
                                title="O\'rtacha ball"
                                value={`${statistics.average_score}%`}
                                color="bg-purple-500"
                            />
                        </div>
                    )}

                    {/* Results Table */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            O\'quvchi ismi
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Elektron pochta
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Holat
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Qoidabuzarliklar
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Sana
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result) => (
                                        <tr key={result.id} className="border-t hover:bg-gray-50">
                                            <td className="px-6 py-3 text-sm text-gray-900">
                                                {result.student_name}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600">
                                                {result.student_email}
                                            </td>
                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                {result.score}/{result.total_questions}
                                            </td>
                                            <td className="px-6 py-3 text-sm">
                                                <span
                                                    className={`px-3 py-1 rounded text-white text-xs font-medium ${
                                                        result.passed
                                                            ? 'bg-green-500'
                                                            : 'bg-red-500'
                                                    }`}
                                                >
                                                    {result.passed ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm">
                                                <span
                                                    className={`px-3 py-1 rounded text-white text-xs font-medium ${
                                                        result.violation_count > 0
                                                            ? 'bg-orange-500'
                                                            : 'bg-green-500'
                                                    }`}
                                                >
                                                    {result.violation_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600">
                                                {new Date(result.submitted_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 text-sm">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/admin/results/${result.id}`)
                                                    }
                                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Tafsilotlar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {results.length === 0 && (
                            <div className="text-center py-12 text-gray-600">
                                <p className="text-lg">Bu test uchun hali natijalar yo\'q</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    color,
}: {
    title: string;
    value: string | number;
    color: string;
}) {
    return (
        <div className={`${color} rounded-lg shadow p-6 text-white`}>
            <p className="text-gray-100 text-sm">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}
