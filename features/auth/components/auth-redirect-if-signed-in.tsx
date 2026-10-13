import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/session";

export const AuthRedirectIfSignedIn = async () => {
  const session = await getSession();
  if (session) redirect("/panel");
  return null;
};
