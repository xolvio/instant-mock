export const config = {
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  backend: {
    url:
      typeof window !== 'undefined' && window.__RUNTIME_CONFIG__
        ? `${window.__RUNTIME_CONFIG__.BACKEND_PROTO || 'http'}://${window.__RUNTIME_CONFIG__.BACKEND_URL}${window.__RUNTIME_CONFIG__.BACKEND_PORT ? `:${window.__RUNTIME_CONFIG__.BACKEND_PORT}` : ''}`
        : `${process.env.REACT_APP_BACKEND_PROTO || 'http'}://${process.env.REACT_APP_BACKEND_URL || 'localhost'}:${process.env.REACT_APP_BACKEND_PORT || '3033'}`,
  },
  frontend: {
    url: `${process.env.REACT_APP_FRONTEND_URL || 'http://localhost'}:${process.env.REACT_APP_FRONTEND_PORT || '3032'}`,
  },
  requireAuth: process.env.REACT_APP_FRONTEND_REQUIRE_AUTH || false,
} as const;

export function useConfig() {
  return config;
}

export const getApiBaseUrl = () => config.backend.url;
