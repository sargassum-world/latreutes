import { UseMutationResult, useMutation } from 'react-query';
import { open } from '@tauri-apps/api/shell';

const useShellOpener = (): UseMutationResult<void, unknown, string> =>
  useMutation(async (path: string) => open(path));

export default useShellOpener;
