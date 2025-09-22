import { useConfirm } from "@/contexts/ConfirmModalProvider";

export function useConfirmModal() {
  return useConfirm();
}
