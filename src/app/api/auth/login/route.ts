import { NextResponse } from "next/server";
import { createSession, normalizeEmail, toSafeUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/resume-validation";
import { getReadableError } from "@/lib/api-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = authSchema.omit({ name: true }).parse(body);
    const email = normalizeEmail(parsed.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "This account was created with Google or Apple. Please continue with that provider." }, { status: 401 });
    }

    if (!(await verifyPassword(parsed.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ user: toSafeUser(user) });
  } catch (error) {
    return NextResponse.json(
      { error: getReadableError(error, "Could not log in. Please try again.") },
      { status: 400 }
    );
  }
}
