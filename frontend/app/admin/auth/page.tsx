'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function AdminAuthPage() {
    const router = useRouter();
    const { setAuth, token, user } = useAuthStore();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{email:string; password:string} | null>(null);
    const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        center_name: '',
        center_email: '',
        admin_name: '',
        phone: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        setGeneratedCredentials(null);

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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        setGeneratedCredentials(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    center_name: formData.center_name,
                    center_email: formData.center_email,
                    admin_name: formData.admin_name,
                    phone: formData.phone,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
                return;
            }

            setGeneratedCredentials(data.data.generated_credentials || null);
            setSuccessMessage(data.message || 'Markaz muvaffaqiyatli ro\'yxatga olindi');
            setFormData((prev) => ({ ...prev, center_name: '', center_email: '', admin_name: '', phone: '', email: '', password: '' }));

            if (user?.role === 'super_admin') {
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
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                        Admin panel
                    </h1>
                    <p className="text-center text-gray-500 mb-6">
                        O\'quv markazlari uchun boshqaruv paneli
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                            {successMessage}
                        </div>
                    )}

                    {generatedCredentials && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
                            <p className="font-semibold mb-2">Yangi admin login va parol:</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 rounded bg-white/70 px-2 py-1">
                                    <span><span className="font-medium">Login:</span> {generatedCredentials.email}</span>
                                    <button type="button" onClick={() => { navigator.clipboard.writeText(generatedCredentials.email); setCopiedField('email'); setTimeout(() => setCopiedField(null), 1200); }} className="text-xs font-semibold text-blue-600">{copiedField === 'email' ? 'Nusxalandi' : 'Nusxalash'}</button>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded bg-white/70 px-2 py-1">
                                    <span><span className="font-medium">Parol:</span> {generatedCredentials.password}</span>
                                    <button type="button" onClick={() => { navigator.clipboard.writeText(generatedCredentials.password); setCopiedField('password'); setTimeout(() => setCopiedField(null), 1200); }} className="text-xs font-semibold text-blue-600">{copiedField === 'password' ? 'Nusxalandi' : 'Nusxalash'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={isLogin ? handleLogin : handleRegister}>
                        {!isLogin && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        O\'quv markazi nomi
                                    </label>
                                    <input
                                        type="text"
                                        name="center_name"
                                        value={formData.center_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Markaz elektron pochtasi
                                    </label>
                                    <input
                                        type="email"
                                        name="center_email"
                                        value={formData.center_email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Administrator to\'liq ismi
                                    </label>
                                    <input
                                        type="text"
                                        name="admin_name"
                                        value={formData.admin_name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefon (ixtiyoriy)
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Elektron pochta
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Parol
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            {showPassword ? 'Yashirish' : 'Ko\'rsatish'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {!isLogin && (
                            <div className="mb-6 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                Yangi admin uchun login va parol avtomatik yaratiladi. Ular ro\'yxatdan so\'ng ekraningizda ko\'rsatiladi.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Yuklanmoqda...' : isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccessMessage('');
                                setGeneratedCredentials(null);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isLogin
                                ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting"
                                : 'Allaqachon hisobingiz bormi? Kirish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
