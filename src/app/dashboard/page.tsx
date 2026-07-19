import DashboardClient from "@/components/DashboardClient";
import { requirePageUser } from "@/lib/page-auth";

export default async function DashboardPage() {
  await requirePageUser("/dashboard");
  return <DashboardClient />;
}
