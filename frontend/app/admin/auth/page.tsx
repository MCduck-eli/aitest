'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function AdminAuthPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login amalga oshmadi');
                return;
            }

            setAuth(data.data.token, data.data.user);
            router.push('/admin/dashboard');
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
                        Admin panel
                    </h1>
                    <p className="text-center text-slate-400 mb-6">
                        O'quv markazlari uchun boshqaruv paneli
                    </p>

                    {error && (
                        <div className="bg-red-950/40 border border-red-900/60 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Elektron pochta
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Parol
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 pr-20 bg-slate-950/80 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300"
                                >
                                    {showPassword ? 'Yashirish' : 'Ko\'rsatish'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Yuklanmoqda...' : 'Kirish'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
