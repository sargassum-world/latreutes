import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check';

type OS = 'linux' | 'macOS' | 'windows';

export function getOS(): OS {
  if (isMacOS()) {
    return 'macOS';
  }

  if (isWindows()) {
    return 'windows';
  }

  return 'linux';
}
