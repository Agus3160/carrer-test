import { getSessionOrRedirect } from "@/shared/lib/session";

export const PanelSessionGate = async () => {
  await getSessionOrRedirect();
  return null;
};
