import { UseMutationResult, useMutation } from 'react-query';
import { Command, open } from '@tauri-apps/api/shell';
import { writeFile } from '@tauri-apps/api/fs';

export const useShellOpener = (): UseMutationResult<void, unknown, string> =>
  useMutation(async (path: string) => open(path));

interface CopyArgs {
  source: string;
  dest: string;
}
export const useSuCopier = (
  onSuccess: () => void,
): UseMutationResult<void, unknown, CopyArgs> =>
  useMutation(
    async ({ source, dest }: CopyArgs) => {
      const command = new Command('pkexec', ['cat', source]);
      const output = await command.execute();
      if (output.code !== 0) {
        throw Error(`Could not open file: ${source}`);
      }
      return writeFile({
        path: dest,
        contents: output.stdout,
      });
    },
    {
      onSuccess,
    },
  );
