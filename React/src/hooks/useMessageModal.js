import { useMessage } from "@/contexts/MessageModalProvider";

export function useMessageModal() {
  return useMessage();
}
