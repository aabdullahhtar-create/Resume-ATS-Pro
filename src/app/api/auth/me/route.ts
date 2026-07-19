import { NextResponse } from "next/server";
import { getCurrentUser, toSafeUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? toSafeUser(user) : null });
}
