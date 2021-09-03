import { UseQueryResult, useQuery } from 'react-query';
import { getVersion } from '@tauri-apps/api/app';
import { configDir, sep } from '@tauri-apps/api/path';
import { FsOptions, readTextFile } from '@tauri-apps/api/fs';

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
export const useVersion = (): UseQueryResult<string> =>
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
export const useConfigPath = (): UseQueryResult<string> =>
  useQuery(QUERY_KEY_CONFIG_PATH, getConfigPath, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

// ZeroTier Auth Token
export const AUTHTOKEN_FILENAME = 'authtoken.secret';
const QUERY_KEY_ZT = [...QUERY_KEY_CONFIG, 'zt'];
const QUERY_KEY_AUTHTOKEN = [...QUERY_KEY_ZT, 'authtoken'];
const QUERY_STALE_AUTHTOKEN = 10; // s
export const useAuthToken = (configDirPath?: string): UseQueryResult<string> =>
  useQuery(
    QUERY_KEY_AUTHTOKEN,
    async () => {
      const configPath = await getConfigPath();
      const filePath = `${configPath}${AUTHTOKEN_FILENAME}`;
      return readFile(filePath);
    },
    {
      enabled: !!configDirPath,
      retry: false,
      staleTime: QUERY_STALE_AUTHTOKEN * 1000,
      cacheTime: Infinity,
    }
  );
