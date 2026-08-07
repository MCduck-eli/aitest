import { API_BASE_URL } from './api';
import { useAuthStore } from './auth';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { token, refreshToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newToken = data.data.accessToken;

            useAuthStore.getState().setAuth(newToken, refreshToken, useAuthStore.getState().user);

            onTokenRefreshed(newToken);

            return apiFetch(url, options);
          } else {

            useAuthStore.getState().logout();
            window.location.href = '/admin/auth';
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          useAuthStore.getState().logout();
          window.location.href = '/admin/auth';
          throw error;
        } finally {
          isRefreshing = false;
        }
      } else {

        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            apiFetch(url, options).then(resolve).catch(reject);
          });
        });
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};
