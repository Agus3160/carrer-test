"use server";

import { logout } from "@/shared/lib/session";
import { redirect } from "next/navigation";

export const signout = async () => {
  await logout();
  redirect("/auth/signin");
};
