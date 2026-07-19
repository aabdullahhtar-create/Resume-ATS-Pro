import AIResumeGenerator from "@/components/AIResumeGenerator";
import { requirePageUser } from "@/lib/page-auth";

export default async function GenerateAIPage() {
  await requirePageUser("/generate-ai");
  return <AIResumeGenerator />;
}
