import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { one, type UserRow } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ProfileForm from "@/components/admin/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Profile" };

export default async function MyProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const row = await one<UserRow>("SELECT * FROM users WHERE id = ?", [user.id]);
  if (!row) redirect("/login");

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your account information"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Profile" }]}
      />
      <ProfileForm
        initial={{
          email: row.email,
          username: row.username,
          name: row.name,
          gender: row.gender,
          avatarUrl: row.avatar_url,
          useGravatar: !!row.use_gravatar,
        }}
      />
    </div>
  );
}
