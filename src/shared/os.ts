import type { UseQueryStoreResult } from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';
import { arch, platform, type, version } from '@tauri-apps/api/os';

import { APPLICATION_NAMESPACE } from './config';

// Types

export type Platform =
  | 'linux'
  | 'darwin'
  | 'ios'
  | 'freebsd'
  | 'dragonfly'
  | 'netbsd'
  | 'openbsd'
  | 'solaris'
  | 'android'
  | 'win32';

export type Arch =
  | 'x86'
  | 'x86_64'
  | 'arm'
  | 'aarch64'
  | 'mips'
  | 'mips64'
  | 'powerpc'
  | 'powerpc64'
  | 'riscv64'
  | 's390x'
  | 'sparc64';

export type PlatformType = 'Linux' | 'Darwin' | 'Windows_NT';

// Queries

// OS Platform
const QUERY_KEY_PLATFORM = [APPLICATION_NAMESPACE, 'os', 'platform'];
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

// OS Architecture
const QUERY_KEY_ARCH = [APPLICATION_NAMESPACE, 'os', 'arch'];
export const useArch = (): UseQueryStoreResult<
  string,
  unknown,
  Arch,
  string[]
> =>
  useQuery(QUERY_KEY_ARCH, arch, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

// OS Platform Type
const QUERY_KEY_TYPE = [APPLICATION_NAMESPACE, 'os', 'type'];
export const usePlatformType = (): UseQueryStoreResult<
  string,
  unknown,
  PlatformType,
  string[]
> =>
  useQuery(QUERY_KEY_TYPE, type, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

// OS Version
const QUERY_KEY_VERSION = [APPLICATION_NAMESPACE, 'os', 'version'];
export const useVersion = (): UseQueryStoreResult<
  string,
  unknown,
  string,
  string[]
> =>
  useQuery(QUERY_KEY_VERSION, version, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
