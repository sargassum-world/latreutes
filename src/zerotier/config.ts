import { getOS } from '../shared/os';

export function getZtOneConfigPath(): string {
  switch (getOS()) {
    case 'linux':
      return '/var/lib/zerotier-one/';
    case 'macOS':
      return '/Library/Application Support/ZeroTier/One/';
    case 'windows':
      return '\\ProgramData\\ZeroTier\\One\\';
    default:
      return '/var/lib/zerotier-one/';
  }
}
