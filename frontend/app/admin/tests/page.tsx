'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function TestsPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        duration_minutes: 60,
        passing_score: 60,
    });

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
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }

            const data = await response.json();
            setTests(data.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/tests`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create test');
            }

            setFormData({
                title: '',
                description: '',
                subject: '',
                duration_minutes: 60,
                passing_score: 60,
            });
            setShowForm(false);
            await fetchTests();
        } catch (error) {
            alert('Failed to create test');
        }
    };

    const handleDeleteTest = async (testId: string) => {
        if (confirm('Are you sure you want to delete this test?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/admin/tests/${testId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete test');
                }

                await fetchTests();
            } catch (error) {
                alert('Failed to delete test');
            }
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
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Testlar</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showForm ? 'Bekor qilish' : '+ Test yaratish'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Yangi test yaratish</h2>
                    <form onSubmit={handleCreateTest}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Test nomi"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Fan (masalan: Matematika)"
                                value={formData.subject}
                                onChange={(e) =>
                                    setFormData({ ...formData, subject: e.target.value })
                                }
                                className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                type="number"
                                placeholder="Davomiyligi (daqiqa)"
                                value={formData.duration_minutes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        duration_minutes: parseInt(e.target.value),
                                    })
                                }
                                className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <input
                                type="number"
                                placeholder="O\'tish bali (%)"
                                value={formData.passing_score}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        passing_score: parseInt(e.target.value),
                                    })
                                }
                                className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <textarea
                            placeholder="Tavsif"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />

                        <button
                            type="submit"
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Test yaratish
                        </button>
                    </form>
                </div>
            )}

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map((test) => (
                    <div
                        key={test.id}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{test.description}</p>

                        <div className="space-y-2 mb-4 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Fan:</span> {test.subject || 'Yo\'q'}
                            </p>
                            <p>
                                <span className="font-medium">Davomiyligi:</span> {test.duration_minutes} daq
                            </p>
                            <p>
                                <span className="font-medium">Savollar:</span> {test.total_questions}
                            </p>
                            <p>
                                <span className="font-medium">O\'tish bali:</span> {test.passing_score}%
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push(`/admin/tests/${test.id}/edit`)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                Tahrirlash
                            </button>
                            <button
                                onClick={() => handleDeleteTest(test.id)}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                O\'chirish
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tests.length === 0 && (
                <div className="text-center text-gray-600 py-12">
                    <p className="text-lg">Hali testlar yo\'q. Birinchi testni yarating!</p>
                </div>
            )}
        </div>
    );
}
