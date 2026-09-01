import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { one } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const row = await one<{ avatar_url: string }>(
    "SELECT avatar_url FROM users WHERE id = ?",
    [user.id]
  );

  return (
    <AdminShell user={{ name: user.name, email: user.email, avatar_url: row?.avatar_url }}>
      {children}
    </AdminShell>
  );
}
