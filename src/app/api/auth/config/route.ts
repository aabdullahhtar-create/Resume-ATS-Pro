import { NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/auth-config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getAuthConfig());
}
