import type { PlatformType } from '../shared/os';

export function getZtOneConfigPath(platformType: PlatformType): string {
  switch (platformType) {
    case 'Linux':
      return '/var/lib/zerotier-one/';
    case 'Darwin':
      return '/Library/Application Support/ZeroTier/One/';
    case 'Windows_NT':
      return '\\ProgramData\\ZeroTier\\One\\';
    default:
      return '/var/lib/zerotier-one/';
  }
}
