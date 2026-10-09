import { isThereSession } from "@/shared/lib/session";
import { NextRequest, NextResponse } from "next/server";

const routes = ["/panel"];

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isProtected = routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtected) return NextResponse.next();

  const hasSesson = await isThereSession(request);

  if (!hasSesson)
    return NextResponse.redirect(new URL("/auth/signin", request.url));

  return NextResponse.next();
};
