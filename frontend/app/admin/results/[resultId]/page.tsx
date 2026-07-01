'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function ResultDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { token } = useAuthStore();
    const resultId = params.resultId as string;

    const [resultData, setResultData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
            return;
        }

        fetchResultDetail();
    }, [token, router, resultId]);

    const fetchResultDetail = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/results/results/${resultId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch result');
            }

            const data = await response.json();
            setResultData(data.data);
        } catch (error) {
            console.error('Error fetching result:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!resultData) {
        return <div className="text-center py-12 text-red-600">Result not found</div>;
    }

    const { result, answers, violations } = resultData;

    return (
        <div>
            <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700 mb-6">
                ← Back
            </button>

            {/* Student Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{result.student_name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-medium text-gray-900">{result.student_email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="text-lg font-medium text-gray-900">{result.score}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p
                            className={`text-lg font-medium ${
                                result.passed ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {result.passed ? 'Passed' : 'Failed'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Violations</p>
                        <p className="text-lg font-medium text-gray-900">{result.violation_count}</p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Started</p>
                        <p className="text-sm text-gray-900">
                            {new Date(result.started_at).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-sm text-gray-900">
                            {new Date(result.submitted_at).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm text-gray-900">
                            {result.exam_duration_seconds
                                ? `${Math.floor(result.exam_duration_seconds / 60)} min`
                                : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Suspicious</p>
                        <p className="text-sm text-gray-900">
                            {result.has_suspicious_activity ? '⚠️ Yes' : '✓ No'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Violations */}
            {violations && violations.length > 0 && (
                <div className="bg-yellow-50 rounded-lg shadow p-6 mb-8 border border-yellow-200">
                    <h2 className="text-xl font-bold text-yellow-900 mb-4">Proctoring Violations</h2>
                    <div className="space-y-3">
                        {violations.map((violation: any) => (
                            <div key={violation.id} className="bg-white rounded p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {violation.violation_type}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {violation.violation_details}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded text-white text-xs font-medium ${
                                            violation.severity === 'high'
                                                ? 'bg-red-500'
                                                : violation.severity === 'medium'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-blue-500'
                                        }`}
                                    >
                                        {violation.severity}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {new Date(violation.created_at).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Answers */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Question Answers</h2>
                <div className="space-y-6">
                    {answers.map((answer: any, index: number) => (
                        <div key={answer.id} className="border-l-4 border-gray-300 pl-4 pb-4">
                            <p className="text-sm text-gray-600 mb-1">Question {index + 1}</p>
                            <p className="font-medium text-gray-900 mb-3">
                                {answer.question_text}
                            </p>

                            <div className="mb-3">
                                <p className="text-sm text-gray-700 mb-2">Student's Answer:</p>
                                <div
                                    className={`px-3 py-2 rounded ${
                                        answer.is_correct
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    <p className="text-sm">
                                        {answer.selected_option || 'Not answered'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-xs text-gray-600">
                                <p>
                                    <span className="font-medium">Difficulty:</span>{' '}
                                    {answer.difficulty_level}
                                </p>
                                <p>
                                    <span className="font-medium">Time Taken:</span>{' '}
                                    {answer.time_taken_seconds
                                        ? `${answer.time_taken_seconds} sec`
                                        : 'N/A'}
                                </p>
                                <p className="mt-2">
                                    <span className="font-medium">Result:</span>{' '}
                                    {answer.is_correct ? (
                                        <span className="text-green-600">✓ Correct</span>
                                    ) : (
                                        <span className="text-red-600">✗ Incorrect</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
