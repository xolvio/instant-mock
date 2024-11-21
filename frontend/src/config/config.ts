export const config = {
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',
  backend: {
    url: `${process.env.REACT_APP_BACKEND_URL || 'http://localhost'}:${process.env.REACT_APP_BACKEND_PORT || '3033'}`,
  },
  frontend: {
    url: `${process.env.REACT_APP_FRONTEND_URL || 'http://localhost'}:${process.env.REACT_APP_FRONTEND_PORT || '3032'}`,
  },
} as const;

export function useConfig() {
  return config;
}

export const getApiBaseUrl = () => config.backend.url;
