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

  console.log('API Fetch:', { url, API_BASE_URL, hasToken: !!token, hasRefreshToken: !!refreshToken });

  // Add authorization header if token exists
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('Fetching:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log('Response status:', response.status);

    // If 401 unauthorized, try to refresh token
    if (response.status === 401 && refreshToken) {
      console.log('Attempting token refresh...');
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

          console.log('Refresh response status:', refreshResponse.status);

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newToken = data.data.accessToken;
            
            console.log('Token refreshed successfully');
            
            // Update auth store with new token
            useAuthStore.getState().setAuth(newToken, refreshToken, useAuthStore.getState().user);
            
            onTokenRefreshed(newToken);
            
            // Retry original request with new token
            return apiFetch(url, options);
          } else {
            console.error('Refresh response not OK:', refreshResponse.status);
            // Refresh failed, logout user
            useAuthStore.getState().logout();
            window.location.href = '/admin/auth';
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          console.error('Token refresh error:', error);
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
    console.error('API fetch error:', error);
    throw error;
  }
};
