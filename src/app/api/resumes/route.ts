import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resumePayloadSchema } from "@/lib/resume-validation";
import { analyzeResumeData } from "@/lib/ats";
import type { ResumeData } from "@/lib/resume";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Please log in first." }, { status: 401 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      template: true,
      atsScore: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const parsed = resumePayloadSchema.parse(await request.json());
    const atsScore = typeof parsed.atsScore === "number" ? parsed.atsScore : analyzeResumeData(parsed.data as ResumeData).score;

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: parsed.title,
        template: parsed.template,
        data: parsed.data as object,
        atsScore
      }
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not save resume", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
