'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function TestEditPage() {
    const router = useRouter();
    const params = useParams();
    const { token } = useAuthStore();
    const testId = params.testId as string;

    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [questionFormData, setQuestionFormData] = useState({
        question_text: '',
        difficulty_level: 'medium' as const,
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ],
    });

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
            return;
        }

        fetchTestAndQuestions();
    }, [token, router, testId]);

    const fetchTestAndQuestions = async () => {
        try {
            const [testRes, questionsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/tests/${testId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/admin/tests/${testId}/questions`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (!testRes.ok || !questionsRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const testData = await testRes.json();
            const questionsData = await questionsRes.json();

            setTest(testData.data);
            setQuestions(questionsData.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/admin/tests/${testId}/questions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_text: questionFormData.question_text,
                    question_type: 'multiple_choice',
                    difficulty_level: questionFormData.difficulty_level,
                    options: questionFormData.options.filter((opt) => opt.text.trim()),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create question');
            }

            setQuestionFormData({
                question_text: '',
                difficulty_level: 'medium',
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            });
            setShowQuestionForm(false);
            await fetchTestAndQuestions();
        } catch (error) {
            console.error('Error adding question:', error);
            alert('Failed to add question');
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (confirm('Are you sure you want to delete this question?')) {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/admin/tests/${testId}/questions/${questionId}`,
                    {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` },
                    },
                );

                if (!response.ok) {
                    throw new Error('Failed to delete question');
                }

                await fetchTestAndQuestions();
            } catch (error) {
                console.error('Error deleting question:', error);
                alert('Failed to delete question');
            }
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!test) {
        return <div className="text-center py-12 text-red-600">Test not found</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-700 mb-4"
                >
                    ← Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
                <p className="text-gray-600">{test.description}</p>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Questions ({questions.length})</h2>
                <button
                    onClick={() => setShowQuestionForm(!showQuestionForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {showQuestionForm ? 'Cancel' : '+ Add Question'}
                </button>
            </div>

            {showQuestionForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Add Question</h3>
                    <form onSubmit={handleAddQuestion}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Text
                            </label>
                            <textarea
                                value={questionFormData.question_text}
                                onChange={(e) =>
                                    setQuestionFormData({
                                        ...questionFormData,
                                        question_text: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty Level
                            </label>
                            <select
                                value={questionFormData.difficulty_level}
                                onChange={(e) =>
                                    setQuestionFormData({
                                        ...questionFormData,
                                        difficulty_level: e.target.value as any,
                                    })
                                }
                                className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Answer Options
                            </label>
                            {questionFormData.options.map((option, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder={`Option ${index + 1}`}
                                        value={option.text}
                                        onChange={(e) => {
                                            const newOptions = [...questionFormData.options];
                                            newOptions[index].text = e.target.value;
                                            setQuestionFormData({
                                                ...questionFormData,
                                                options: newOptions,
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={option.isCorrect}
                                            onChange={() => {
                                                const newOptions = questionFormData.options.map(
                                                    (opt, i) => ({
                                                        ...opt,
                                                        isCorrect: i === index,
                                                    }),
                                                );
                                                setQuestionFormData({
                                                    ...questionFormData,
                                                    options: newOptions,
                                                });
                                            }}
                                        />
                                        <span className="text-sm">Correct</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add Question
                        </button>
                    </form>
                </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Question {index + 1}</p>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {question.question_text}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Difficulty: <span className="font-medium">{question.difficulty_level}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                            <ul className="space-y-1">
                                {question.options?.map((option: any) => (
                                    <li
                                        key={option.id}
                                        className={`text-sm px-3 py-2 rounded ${
                                            option.is_correct
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {option.option_text} {option.is_correct && '✓'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {questions.length === 0 && (
                <div className="text-center text-gray-600 py-12">
                    <p className="text-lg">No questions yet. Add your first question!</p>
                </div>
            )}
        </div>
    );
}
