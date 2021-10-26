import { Platform } from '../shared/os';

export function getZtOneConfigPath(platform: Platform): string {
  switch (platform) {
    case 'linux':
      return '/var/lib/zerotier-one/';
    case 'darwin':
      return '/Library/Application Support/ZeroTier/One/';
    case 'win32':
      return '\\ProgramData\\ZeroTier\\One\\';
    default:
      return '/var/lib/zerotier-one/';
  }
}
