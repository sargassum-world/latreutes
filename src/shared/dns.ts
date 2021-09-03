import { UseQueryResult, useQuery } from 'react-query';
import { invoke } from '@tauri-apps/api/tauri';

export const QUERY_KEY_DNS = ['latreutes', 'dns'];
const QUERY_KEY = [...QUERY_KEY_DNS, 'lookup'];
const QUERY_STALE = 30; // s

// TXT record lookup
const QUERY_KEY_TXT = [...QUERY_KEY, 'txt'];
export function txtResolver(hostname: string) {
  return async (): Promise<string[]> => {
    try {
      return await invoke<string[]>('dns_lookup_txt', { hostname });
    } catch (e) {
      throw new Error(`Could not look up TXT records for ${hostname}.`);
    }
  };
}
export const useTxtResolver = (
  hostname: string
): UseQueryResult<string[], Error> =>
  useQuery([...QUERY_KEY_TXT, hostname], txtResolver(hostname), {
    retry: false,
    staleTime: QUERY_STALE * 1000,
    cacheTime: Infinity,
  });

// Reverse lookup
const QUERY_KEY_REVERSE = [...QUERY_KEY, 'reverse'];
export function reverseResolver(ipAddr: string) {
  return async (): Promise<string[]> => {
    try {
      return await invoke<string[]>('dns_lookup_reverse', { ipAddr });
    } catch (e) {
      throw new Error(`Could not perform reverse lookup of ${ipAddr}.`);
    }
  };
}
export const useReverseResolver = (
  ipAddr: string
): UseQueryResult<string[], Error> =>
  useQuery([...QUERY_KEY_REVERSE, ipAddr], reverseResolver(ipAddr), {
    retry: false,
    staleTime: QUERY_STALE * 1000,
    cacheTime: Infinity,
  });
