import {
  QueryClient,
  UseQueryStoreResult,
  MutationStoreResult,
  useQuery,
  useMutation,
} from '@sveltestack/svelte-query';
import { getVersion } from '@tauri-apps/api/app';
import { configDir, sep } from '@tauri-apps/api/path';
import { FsOptions, readTextFile, createDir } from '@tauri-apps/api/fs';

export const APPLICATION_NAMESPACE = 'latreutes';
export const QUERY_KEY_CONFIG = [APPLICATION_NAMESPACE, 'config'];

// Utils

async function readFile(path: string, options?: FsOptions) {
  const fileContents = await readTextFile(path, options);
  if (fileContents) {
    return fileContents;
  }
  throw new Error('Empty file!');
}

// Queries

// App Version
const QUERY_KEY_VERSION = [APPLICATION_NAMESPACE, 'version'];
export const useVersion = (): UseQueryStoreResult<
  string,
  unknown,
  string,
  string[]
> =>
  useQuery(QUERY_KEY_VERSION, getVersion, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

// Config Directory
const QUERY_KEY_CONFIG_PATH = [...QUERY_KEY_CONFIG, 'path'];
export const CONFIG_PARENT = 'sargassum';
export async function getConfigPath(): Promise<string> {
  const configBasePath = await configDir();
  const configSubpath = `${CONFIG_PARENT}${sep}${APPLICATION_NAMESPACE}`;
  return `${configBasePath}${configSubpath}${sep}`;
}
export const useConfigPath = (): UseQueryStoreResult<
  string,
  unknown,
  string,
  string[]
> =>
  useQuery(QUERY_KEY_CONFIG_PATH, getConfigPath, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
export const useConfigDirMaker = (): MutationStoreResult<void, unknown, void> =>
  useMutation(async () => {
    const configPath = await getConfigPath();
    await createDir(configPath, { recursive: true });
  });

// ZeroTier Auth Token
export const AUTHTOKEN_FILENAME = 'authtoken.secret';
const QUERY_KEY_ZT = [...QUERY_KEY_CONFIG, 'zt'];
const QUERY_KEY_AUTHTOKEN = [...QUERY_KEY_ZT, 'authtoken'];
export const useAuthToken = (
  configDirPath?: string,
): UseQueryStoreResult<string, unknown, string, string[]> =>
  useQuery(
    QUERY_KEY_AUTHTOKEN,
    async () => {
      if (configDirPath === undefined) {
        throw Error('Missing directory path for authtoken.secret file!');
      }
      const filePath = `${configDirPath}${AUTHTOKEN_FILENAME}`;
      const fileContents = await readFile(filePath);
      return fileContents.trim();
    },
    {
      enabled: !!configDirPath,
      retry: false,
      retryOnMount: false, // if this is true, the query will always retry instantly in a svelte component with transitions, blocking other work
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  );
export const invalidateAuthTokenCache = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries(QUERY_KEY_AUTHTOKEN, {
    refetchInactive: true,
  });
};
