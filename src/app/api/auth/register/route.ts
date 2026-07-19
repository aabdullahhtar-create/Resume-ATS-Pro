import { NextResponse } from "next/server";
import { createSession, hashPassword, normalizeEmail, toSafeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authSchema } from "@/lib/resume-validation";
import { getReadableError } from "@/lib/api-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = authSchema.parse(body);
    const email = normalizeEmail(parsed.email);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account already exists with this email. Please log in instead." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.name?.trim() || null,
        passwordHash: await hashPassword(parsed.password)
      }
    });

    await createSession(user.id);
    return NextResponse.json({ user: toSafeUser(user) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getReadableError(error, "Could not create account. Please check your details and try again.") },
      { status: 400 }
    );
  }
}
