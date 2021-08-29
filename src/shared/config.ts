import { useQuery } from 'react-query'
import { appDir } from '@tauri-apps/api/path'
import { BaseDirectory, FsOptions, readTextFile } from '@tauri-apps/api/fs'

export const APPLICATION_NAMESPACE = 'latreutes'
export const QUERY_KEY_CONFIG = [APPLICATION_NAMESPACE, 'config']

// Utils

async function readFile(path: string, options?: FsOptions) {
  const fileContents = await readTextFile(path, options)
  if (fileContents) {
    return fileContents
  }
  throw new Error('Empty file!')
}

// Queries

// Config Directory
const QUERY_KEY_CONFIG_PATH = [...QUERY_KEY_CONFIG, 'path']
export const useConfigPath = () => useQuery(QUERY_KEY_CONFIG_PATH, appDir, {
  staleTime: Infinity,
  cacheTime: Infinity,
})

// ZeroTier Auth Token
export const AUTHTOKEN_FILENAME = 'authtoken.secret'
const QUERY_KEY_ZT = [...QUERY_KEY_CONFIG, 'zt']
const QUERY_KEY_AUTHTOKEN = [...QUERY_KEY_ZT, 'authtoken']
const QUERY_STALE_AUTHTOKEN = 10  // s
export const useAuthToken = (configDirPath?: string) => useQuery(
  QUERY_KEY_AUTHTOKEN,
  async () => await readFile(AUTHTOKEN_FILENAME, { dir: BaseDirectory.App }),
  {
    enabled: !!configDirPath,
    retry: false,
    staleTime: QUERY_STALE_AUTHTOKEN * 1000,
    cacheTime: Infinity,
  },
)
