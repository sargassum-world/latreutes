import { MutationStoreResult, useMutation } from '@sveltestack/svelte-query';
import { Command, open } from '@tauri-apps/api/shell';
import { writeFile } from '@tauri-apps/api/fs';

export const useShellOpener = (): MutationStoreResult<void, unknown, string> =>
  useMutation(async (path: string) => open(path));

interface CopyArgs {
  source: string;
  dest: string;
}
export const useSuCopier = (
  onSuccess: () => void,
): MutationStoreResult<void, unknown, CopyArgs, string[]> =>
  useMutation(
    async ({ source, dest }: CopyArgs) => {
      // FIXME: command execution should only be done in Rust, for security reasons
      const command = new Command('pkexec', ['cat', source]);
      const output = await command.execute();
      if (output.code !== 0) {
        throw Error(`Could not open file: ${source}`);
      }
      // FIXME: file-writing should only be done in Rust, for security reasons
      return writeFile({
        path: dest,
        contents: output.stdout,
      });
    },
    {
      onSuccess,
    },
  );
