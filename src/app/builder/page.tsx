import { Suspense } from "react";
import ResumeBuilder from "@/components/ResumeBuilder";
import { requirePageUser } from "@/lib/page-auth";

export default async function BuilderPage() {
  await requirePageUser("/builder");

  return (
    <Suspense fallback={<main className="p-8 font-bold">Loading builder...</main>}>
      <ResumeBuilder />
    </Suspense>
  );
}
