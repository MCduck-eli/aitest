import { create } from 'zustand';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: any | null;
    setAuth: (token: string, refreshToken: string, user: any) => void;
    logout: () => void;
}

const getUserFromStorage = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined') return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
    user: getUserFromStorage(),
    setAuth: (token, refreshToken, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, refreshToken, user });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ token: null, refreshToken: null, user: null });
    },
}));
