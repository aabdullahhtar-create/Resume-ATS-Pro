import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resumePatchSchema } from "@/lib/resume-validation";
import { analyzeResumeData } from "@/lib/ats";
import type { ResumeData } from "@/lib/resume";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function unauthorized() {
  return NextResponse.json({ error: "Please log in first." }, { status: 401 });
}

async function getOwnedResume(id: string, userId: string) {
  return prisma.resume.findFirst({ where: { id, userId } });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const resume = await getOwnedResume(id, user.id);
  if (!resume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  return NextResponse.json({ resume });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const existingResume = await getOwnedResume(id, user.id);
  if (!existingResume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  try {
    const parsed = resumePatchSchema.parse(await request.json());
    const data = parsed.data ?? existingResume.data;
    const atsScore = typeof parsed.atsScore === "number" ? parsed.atsScore : analyzeResumeData(data as ResumeData).score;

    const resume = await prisma.resume.update({
      where: { id: existingResume.id },
      data: {
        ...(parsed.title ? { title: parsed.title } : {}),
        ...(parsed.template ? { template: parsed.template } : {}),
        ...(parsed.data ? { data: parsed.data as object } : {}),
        atsScore
      }
    });

    return NextResponse.json({ resume });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not update resume", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const existingResume = await getOwnedResume(id, user.id);
  if (!existingResume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  await prisma.resume.delete({ where: { id: existingResume.id } });
  return NextResponse.json({ ok: true });
}
