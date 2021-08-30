import { UseMutationResult, useMutation } from 'react-query';
import { appWindow, PhysicalSize, LogicalSize } from '@tauri-apps/api/window';

// Window Size
export { PhysicalSize, LogicalSize } from '@tauri-apps/api/window';
export const useWindowMinSizeSetter = (): UseMutationResult<
  void,
  unknown,
  undefined | PhysicalSize | LogicalSize
> => useMutation(appWindow.setMinSize);
