'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';

export default function AdminIndexPage() {
    const router = useRouter();
    const { token } = useAuthStore();

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
        } else {
            router.push('/admin/dashboard');
        }
    }, [token, router]);

    return <div>Redirecting...</div>;
}
