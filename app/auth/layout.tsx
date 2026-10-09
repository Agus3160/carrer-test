import { getSession } from "@/shared/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const AuthLayout = async ({ children }: Props) => {
  const session = await getSession();
  if (session !== null) return redirect("/panel");
  return children;
};

export default AuthLayout;
