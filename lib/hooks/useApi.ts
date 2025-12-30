import { useState } from 'react';
import axios from 'axios';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const request = async (method: 'get' | 'post' | 'put' | 'delete', url: string, payload?: any) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else {
        setError('An unexpected error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const get = (url: string) => request('get', url);
  const post = (url: string, payload: any) => request('post', url, payload);
  const put = (url: string, payload: any) => request('put', url, payload);
  const remove = (url: string) => request('delete', url);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    remove,
    request,
  };
}