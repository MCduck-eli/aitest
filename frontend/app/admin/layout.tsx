'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        router.push('/admin/auth');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } bg-gray-900 text-white transition-all duration-300 ease-in-out overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-700">
                    <h2 className={`text-xl font-bold ${!sidebarOpen && 'text-center'}`}>
                        {sidebarOpen ? 'AI Test' : 'AT'}
                    </h2>
                </div>

                <nav className="mt-8">
                    <NavLink
                        href="/admin/dashboard"
                        icon="📊"
                        label="Dashboard"
                        open={sidebarOpen}
                    />
                    <NavLink
                        href="/admin/tests"
                        icon="📝"
                        label="Tests"
                        open={sidebarOpen}
                    />
                    <NavLink
                        href="/admin/results"
                        icon="📈"
                        label="Results"
                        open={sidebarOpen}
                    />
                    <NavLink
                        href="/admin/settings"
                        icon="⚙️"
                        label="Settings"
                        open={sidebarOpen}
                    />
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            {sidebarOpen ? '☰' : '→'}
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 font-medium">{user?.full_name}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Logout
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
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800 transition"
            title={open ? '' : label}
        >
            <span className="text-xl">{icon}</span>
            {open && <span>{label}</span>}
        </Link>
    );
}
