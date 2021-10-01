import { UseQueryStoreResult, useQuery } from '@sveltestack/svelte-query';
import { platform } from '@tauri-apps/api/os';

import { APPLICATION_NAMESPACE } from './config';

// Types

export type Platform =
  | 'aix'
  | 'darwin'
  | 'freebsd'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32';

// Queries

// App Version
const QUERY_KEY_PLATFORM = [APPLICATION_NAMESPACE, 'platform'];
export const usePlatform = (): UseQueryStoreResult<
  string,
  unknown,
  Platform,
  string[]
> =>
  useQuery(QUERY_KEY_PLATFORM, platform, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
