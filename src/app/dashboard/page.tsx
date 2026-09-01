import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { all, one } from "@/lib/db";
import { PageHeader, KpiCard, ChartPanel } from "@/components/admin/ui";
import { UsersGrowthChart, RoleDistributionChart } from "@/components/admin/OverviewCharts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Overview" };

const ROLE_LABELS: Record<string, string> = {
  administrator: "Administrator",
  moderator: "Moderator",
  user: "User",
};

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login"); // guard (don't rely on the layout alone)

  const totalRow = await one<{ c: number }>("SELECT COUNT(*) AS c FROM users");
  const totalUsers = Number(totalRow?.c ?? 0);

  const roleRows = await all<{ role: string; c: number }>(
    "SELECT role, COUNT(*) AS c FROM users GROUP BY role"
  );
  const roleCounts: Record<string, number> = { administrator: 0, moderator: 0, user: 0 };
  for (const r of roleRows) {
    const key = r.role in roleCounts ? r.role : "administrator";
    roleCounts[key] += Number(r.c);
  }

  // Users created per month, last 6 months.
  const growthRows = await all<{ month: string; c: number }>(
    `SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS c
       FROM users
      GROUP BY month`
  );
  const growthByMonth = new Map(growthRows.map((r) => [r.month, Number(r.c)]));
  const months: string[] = [];
  const monthLabels: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(key);
    monthLabels.push(d.toLocaleDateString(undefined, { month: "short" }));
  }
  const growthValues = months.map((m) => growthByMonth.get(m) ?? 0);

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Site statistics and insights"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Overview" }]}
      />

      <h2 className="mb-4 text-lg font-semibold text-gray-800">Overview &amp; Statistics</h2>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <KpiCard value={totalUsers} label="Total Users" gradient="purple" />
        <KpiCard value={3} label="User Roles" gradient="pink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Users Growth (Last 6 Months)">
          <UsersGrowthChart labels={monthLabels} values={growthValues} />
        </ChartPanel>
        <ChartPanel title="User Roles Distribution">
          <RoleDistributionChart
            labels={[ROLE_LABELS.administrator, ROLE_LABELS.moderator, ROLE_LABELS.user]}
            values={[roleCounts.administrator, roleCounts.moderator, roleCounts.user]}
          />
        </ChartPanel>
      </div>
    </div>
  );
}
