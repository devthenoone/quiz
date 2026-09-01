import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import WebsiteConfigForm from "@/components/admin/WebsiteConfigForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website Config" };

export default async function WebsiteConfigPage() {
  if (!(await getCurrentUser())) redirect("/login");
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Website Config"
        subtitle="Configure website settings"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Website Config" }]}
      />
      <WebsiteConfigForm initial={settings} />
    </div>
  );
}
