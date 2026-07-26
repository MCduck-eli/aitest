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

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const { token, refreshToken } = useAuthStore.getState();

  // Add authorization header if token exists
  const headers = {
    ...options.headers,
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

    // If 401 unauthorized, try to refresh token
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
            
            // Update auth store with new token
            useAuthStore.getState().setAuth(newToken, refreshToken, useAuthStore.getState().user);
            
            onTokenRefreshed(newToken);
            
            // Retry original request with new token
            return apiFetch(url, options);
          } else {
            // Refresh failed, logout user
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
        // Wait for token refresh to complete
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
