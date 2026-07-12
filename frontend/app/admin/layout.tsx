'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

function NavLink({
    href,
    icon,
    label,
    open,
}: {
    href: string;
    icon: string;
    label: string;
    open: boolean;
}) {
    return (
        <Link
            href={href}
            className="flex items-center p-4 hover:bg-gray-700 transition-colors duration-200"
        >
            <span className="text-2xl">{icon}</span>
            {open && <span className="ml-4 text-lg">{label}</span>}
        </Link>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/admin/auth');
    };

    return (
        <div className="flex h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
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

            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } bg-slate-900/80 text-white transition-all duration-300 ease-in-out overflow-y-auto relative z-10 backdrop-blur-sm`}
            >
                <div className="p-4 border-b border-slate-700">
                    <h2 className={`text-xl font-bold ${!sidebarOpen && 'text-center'}`}>
                        {sidebarOpen ? 'AI Test' : 'AT'}
                    </h2>
                </div>

                <nav className="mt-8">
                    <NavLink
                        href="/admin/dashboard"
                        icon="📊"
                        label="Asosiy panel"
                        open={sidebarOpen}
                    />
                    <NavLink
                        href="/admin/tests"
                        icon="📝"
                        label="Testlar"
                        open={sidebarOpen}
                    />
                    <NavLink
                        href="/admin/results"
                        icon="📈"
                        label="Natijalar"
                        open={sidebarOpen}
                    />
                    <NavLink
                        href="/admin/settings"
                        icon="⚙️"
                        label="Sozlamalar"
                        open={sidebarOpen}
                    />
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Top Bar */}
                <header className="bg-slate-900/80 shadow backdrop-blur-sm">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-white hover:text-gray-300"
                        >
                            {sidebarOpen ? '☰' : '→'}
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-white font-medium">{mounted ? (user?.full_name || 'Admin') : 'Admin'}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Chiqish
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
