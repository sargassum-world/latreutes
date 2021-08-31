import { UseQueryResult, useQuery } from 'react-query';
import { invoke } from '@tauri-apps/api/tauri';

export const QUERY_KEY_DNS = ['latreutes', 'dns'];
const QUERY_KEY = [...QUERY_KEY_DNS, 'lookup'];

// TXT record lookup
const QUERY_KEY_TXT = [...QUERY_KEY, 'txt'];
const QUERY_STALE = 30; // s
export function txtResolver(hostname: string) {
  return async (): Promise<string[]> => {
    try {
      return await invoke<string[]>('dns_lookup_txt', { hostname });
    } catch (e) {
      throw new Error('Could not look up TXT records.');
    }
  };
}
const useTxtResolver = (hostname: string): UseQueryResult<string[], Error> =>
  useQuery([...QUERY_KEY_TXT, hostname], txtResolver(hostname), {
    retry: false,
    staleTime: QUERY_STALE * 1000,
    cacheTime: Infinity,
  });

export default useTxtResolver;
