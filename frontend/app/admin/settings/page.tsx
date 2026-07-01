'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [copied, setCopied] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/admin/auth');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Sozlamalar</h1>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Hisob ma\'lumotlari</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To\'liq ismi
                        </label>
                        <input
                            type="text"
                            value={user?.full_name || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Elektron pochta
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rol
                        </label>
                        <input
                            type="text"
                            value={user?.role || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 capitalize"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            O\'quv markazi ID
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={user?.training_center_id || ''}
                                disabled
                                className="flex-1 px-4 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                            />
                            <button
                                onClick={() =>
                                    copyToClipboard(user?.training_center_id || '')
                                }
                                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {copied ? '✓' : 'Nusxalash'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Documentation */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">API integratsiyasi</h2>
                <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-700 mb-3">
                        API bilan bog\'lanish uchun o\'quv markazi ID\'ingizdan foydalaning:
                    </p>
                    <code className="text-xs bg-gray-900 text-gray-100 p-3 rounded block overflow-x-auto mb-3">
                        {`https://api.example.com/api/v1/tests?center_id=${user?.training_center_id}`}
                    </code>
                    <p className="text-xs text-gray-600">
                        Xavfsiz kirish uchun JWT token bilan Authorization headerni qo\'shing.
                    </p>
                </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Obuna</h2>
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <p className="text-sm text-blue-900 mb-2">
                        <span className="font-medium">Hozirgi tarif:</span> Bepul
                    </p>
                    <p className="text-sm text-blue-800 mb-4">
                        Kengaytirilgan imkoniyatlar, cheksiz testlar va ustuvor qo\'llab-quvvatlash uchun pullik tarifga o\'ting.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Tariflarni ko\'rish
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow p-6 border border-red-200">
                <h2 className="text-xl font-bold text-red-600 mb-4">Xavfli zona</h2>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Chiqish
                </button>
            </div>
        </div>
    );
}
