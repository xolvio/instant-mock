import {getApiBaseUrl} from '../config/config';
import {useState, useEffect} from 'react';

interface AuthProvider {
  id: string;
  name: string;
}

export function useAuthProviders() {
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/auth-providers`);
        const data = await response.json();
        setProviders(data.providers);
      } catch (error) {
        console.error('Failed to fetch auth providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return {providers, loading};
}

