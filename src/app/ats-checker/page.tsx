import AtsChecker from "@/components/AtsChecker";
import { requirePageUser } from "@/lib/page-auth";

export default async function AtsCheckerPage() {
  await requirePageUser("/ats-checker");
  return <AtsChecker />;
}
