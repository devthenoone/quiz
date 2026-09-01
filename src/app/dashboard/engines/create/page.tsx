import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listEngines } from "@/lib/engines";
import { PageHeader } from "@/components/admin/ui";
import EngineForm from "@/components/admin/EngineForm";

export const metadata: Metadata = { title: "Create Engine" };

export default async function CreateEnginePage() {
  if (!(await getCurrentUser())) redirect("/login");
  const engines = await listEngines();

  return (
    <div>
      <PageHeader
        title="Create Engine"
        subtitle="Add a new search engine"
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Search Engines", href: "/dashboard/engines" },
          { label: "Create" },
        ]}
      />
      <EngineForm initial={{ isDefault: engines.length === 0 }} />
    </div>
  );
}
