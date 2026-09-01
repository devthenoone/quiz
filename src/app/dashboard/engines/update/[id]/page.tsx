import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getEngine } from "@/lib/engines";
import { PageHeader } from "@/components/admin/ui";
import EngineForm from "@/components/admin/EngineForm";

export const metadata = { title: "Update Engine" };

export default async function UpdateEnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getCurrentUser())) redirect("/login");

  const { id } = await params;
  const engine = await getEngine(Number(id));
  if (!engine) notFound();

  return (
    <div>
      <PageHeader
        title="Update Engine"
        subtitle="Modify existing engine."
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Search Engines", href: "/dashboard/engines" },
          { label: "Update" },
        ]}
      />
      <EngineForm
        initial={{
          id: engine.id,
          name: engine.name,
          cseCx: engine.cse_cx,
          pubId: engine.pub_id,
          styleId: engine.style_id,
          imageSearch: !!engine.image_search,
          showThumbnails: !!engine.show_thumbnails,
          isDefault: !!engine.is_default,
        }}
      />
    </div>
  );
}
