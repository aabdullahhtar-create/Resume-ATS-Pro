import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requirePageUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
