import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthConfig } from "@/lib/auth-config";
import { getReadableError } from "@/lib/api-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) return false;
  const lowered = value.toLowerCase();
  return !(lowered.includes("user:password") || lowered.includes("placeholder") || lowered.includes("example"));
}

export async function GET() {
  const auth = getAuthConfig();

  if (!hasDatabaseUrl()) {
    return NextResponse.json({
      ok: false,
      database: {
        ok: false,
        message: "DATABASE_URL is missing or still uses a placeholder value. Add a real hosted PostgreSQL connection string, then run npm run db:push."
      },
      auth
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: {
        ok: true,
        message: "Database connected."
      },
      auth
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      database: {
        ok: false,
        message: getReadableError(error, "Database connection failed.")
      },
      auth
    });
  }
}
