import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

function cleanText(text: string) {
  return text.replace(/\u0000/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign up or log in before uploading a resume." }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const name = file.name.toLowerCase();
    const type = file.type;

    let text = "";
    if (type.includes("pdf") || name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (type.includes("word") || name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (type.includes("text") || name.endsWith(".txt")) {
      text = buffer.toString("utf8");
    } else {
      return NextResponse.json({ error: "Unsupported file type. Upload PDF, DOCX, or TXT." }, { status: 400 });
    }

    return NextResponse.json({ filename: file.name, text: cleanText(text), size: file.size });
  } catch (error) {
    return NextResponse.json({ error: "Could not read resume", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
