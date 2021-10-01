import { UseQueryStoreResult, useQuery } from '@sveltestack/svelte-query';
import { invoke } from '@tauri-apps/api/tauri';
import isFQDN from 'validator/es/lib/isFQDN';
import isIP from 'validator/es/lib/isIP';

export const QUERY_KEY_DNS = ['latreutes', 'dns'];
const QUERY_KEY = [...QUERY_KEY_DNS, 'lookup'];
const QUERY_STALE = 30; // s

// TXT record lookup

const QUERY_KEY_TXT = [...QUERY_KEY, 'txt'];
export function txtResolver(domainName: string) {
  return async (): Promise<string[]> => {
    try {
      return await invoke<string[]>('dns_lookup_txt', { domainName });
    } catch (e) {
      throw new Error(`Could not look up TXT records for ${domainName}.`);
    }
  };
}
export const useTxtResolver = (
  domainName: string,
): UseQueryStoreResult<string[], Error, string[], string[]> =>
  useQuery([...QUERY_KEY_TXT, domainName], txtResolver(domainName), {
    enabled: !!domainName && isFQDN(domainName),
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
  ipAddr: string,
): UseQueryStoreResult<string[], Error, string[], string[]> =>
  useQuery([...QUERY_KEY_REVERSE, ipAddr], reverseResolver(ipAddr), {
    enabled: !!ipAddr && isIP(ipAddr),
    retry: false,
    staleTime: QUERY_STALE * 1000,
    cacheTime: Infinity,
  });

// Utilities

export function hasDomainName(identifier: string): boolean {
  let domainName = '';
  try {
    domainName = new URL(identifier).hostname;
  } catch {
    domainName = identifier;
  }
  return isFQDN(domainName, { require_tld: true, allow_trailing_dot: true });
}
