import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import EmailSetupForm from "@/components/admin/EmailSetupForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Email Setup" };

export default async function EmailSetupPage() {
  if (!(await getCurrentUser())) redirect("/login");
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Email Setup"
        subtitle="Configure email server settings"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Email Setup" }]}
      />
      <EmailSetupForm initial={settings} />
    </div>
  );
}
