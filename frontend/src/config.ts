export const getApiBaseUrl = () =>
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_BASE_URL || 'http://localhost:3007'
    : '';
