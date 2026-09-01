import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listEngines } from "@/lib/engines";
import { PageHeader, GradientLinkButton, TableCard, Badge, OutlineLinkButton } from "@/components/admin/ui";
import EngineActions from "@/components/admin/EngineActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search Engines" };

export default async function EnginesPage() {
  if (!(await getCurrentUser())) redirect("/login");
  const engines = await listEngines();

  return (
    <div>
      <PageHeader
        title="Search Engines"
        subtitle="Manage and configure search engines"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Search Engines" }]}
        action={<GradientLinkButton href="/dashboard/engines/create">+ Create Engine</GradientLinkButton>}
      />

      <TableCard title="Manage Search Engines">
        {engines.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No search engines yet.{" "}
            <a href="/dashboard/engines/create" className="font-medium text-admin-crimson hover:underline">
              Create one
            </a>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-purple-500 text-left text-[11px] uppercase tracking-wide text-white">
                  <th className="px-5 py-3 font-semibold">Engine Name</th>
                  <th className="px-5 py-3 font-semibold">Engine CSE ID</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {engines.map((e) => (
                  <tr key={e.id} className="border-b border-admin-border last:border-0 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        {e.name}
                        {!!e.is_default && <Badge tone="green">default</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                        {e.cse_cx || "—"}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <OutlineLinkButton href={`/dashboard/engines/update/${e.id}`} tone="red">
                          Edit
                        </OutlineLinkButton>
                        <EngineActions id={e.id} isDefault={!!e.is_default} onlyEngine={engines.length <= 1} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-admin-border px-4 py-3 text-xs text-gray-500">
          Showing 1–{engines.length} of {engines.length} entries
        </div>
      </TableCard>
    </div>
  );
}
