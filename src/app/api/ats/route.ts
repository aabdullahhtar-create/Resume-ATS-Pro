import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeTextResume } from "@/lib/ats";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  resumeText: z.string().min(1),
  jobDescription: z.string().optional()
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign up or log in before using the ATS checker." }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    return NextResponse.json(analyzeTextResume(parsed.resumeText, parsed.jobDescription));
  } catch (error) {
    return NextResponse.json({ error: "Invalid ATS request", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}
