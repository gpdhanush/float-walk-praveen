import { useAuthStore } from '@/stores/authStore';
import { useLoadingStore } from '@/stores/loadingStore';

export const API_URL = import.meta.env.VITE_API_URL;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const getAuthData = () => {
  const authStore = localStorage.getItem('auth-store');
  if (authStore) {
    try {
      const { state } = JSON.parse(authStore);
      return state;
    } catch (e) {
      console.error('Error parsing auth store', e);
    }
  }
  return null;
};

const updateAuthTokens = (newToken: string, newRefreshToken?: string) => {
  useAuthStore.setState((state) => ({
    ...state,
    token: newToken,
    ...(newRefreshToken ? { refreshToken: newRefreshToken } : {}),
  }));
  const authStore = localStorage.getItem('auth-store');
  if (authStore) {
    try {
      const parsed = JSON.parse(authStore);
      parsed.state.token = newToken;
      if (newRefreshToken) parsed.state.refreshToken = newRefreshToken;
      localStorage.setItem('auth-store', JSON.stringify(parsed));
    } catch (e) {
      console.error('Error updating auth token', e);
    }
  }
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authData = getAuthData();
  if (authData?.token) {
    headers['Authorization'] = `Bearer ${authData.token}`;
  }
  return headers;
};

async function refreshAccessToken(): Promise<string | null> {
  const authData = getAuthData();
  if (!authData?.refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: authData.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken || data.accessToken;
    const newRefreshToken = data.data?.refreshToken || data.refreshToken;
    
    if (newAccessToken) {
      updateAuthTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

async function handleResponse(response: Response, retryFn?: () => Promise<Response>): Promise<any> {
  if (response.status === 401 && retryFn) {
    // If we are already on the login page, don't try to refresh or redirect
    if (window.location.pathname === '/login') {
        return null;
    }

    // Token might be expired, try to refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          processQueue();
          isRefreshing = false;
          const retryResponse = await retryFn();
          return handleResponse(retryResponse);
        } else {
          processQueue(new Error('Token refresh failed'));
          isRefreshing = false;
          // Use store logout for clean state cleanup
          useAuthStore.getState().logout();
          throw new Error('Session expired. Please login again.');
        }
      } catch (error) {
        processQueue(error);
        isRefreshing = false;
        throw error;
      }
    } else {
      // Already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => retryFn().then(resp => handleResponse(resp)));
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || response.statusText);
  }
  
  // Handle empty responses (like 204 No Content)
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return null;
  }
  
  return response.json();
}

async function request(makeRequest: () => Promise<Response>): Promise<any> {
  const { startRequest, finishRequest } = useLoadingStore.getState();
  startRequest();
  try {
    const response = await makeRequest();
    return await handleResponse(response, makeRequest);
  } finally {
    finishRequest();
  }
}

export const api = {
  get: async (endpoint: string) => {
      const makeRequest = () => fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
      return request(makeRequest);
  },
  post: async (endpoint: string, data: any) => {
    const makeRequest = () => fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
      return request(makeRequest);
  },
  put: async (endpoint: string, data: any) => {
    const makeRequest = () => fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
      return request(makeRequest);
  },
  patch: async (endpoint: string, data: any) => {
    const makeRequest = () => fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
      return request(makeRequest);
  },
  delete: async (endpoint: string) => {
    const makeRequest = () => fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
      return request(makeRequest);
  },
};
