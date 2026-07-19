import TemplateGallery from "@/components/TemplateGallery";
import { requirePageUser } from "@/lib/page-auth";

export default async function TemplatesPage() {
  await requirePageUser("/templates");

  return (
    <main className="px-6 py-12">
      <TemplateGallery />
    </main>
  );
}
