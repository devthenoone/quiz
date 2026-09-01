"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "▤" },
  { href: "/dashboard/articles", label: "Articles", icon: "▦" },
  { href: "/dashboard/engines", label: "Search Engines", icon: "◎" },
];

const SETTINGS_NAV = [
  { href: "/dashboard/settings/site", label: "Website Config" },
  { href: "/dashboard/settings/email", label: "Email Setup" },
];

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; avatar_url?: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-admin-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-admin-crimson px-6">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Jobs Near Me
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-admin-crimson">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-base">⏻</span>
              )}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-bold text-white">{user.name}</span>
              <span className="block text-[11px] text-white/80">Administrator</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white/80">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border bg-white p-2 shadow-lg">
              <Link
                href="/dashboard/account/settings"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                href="/"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                View site ↗
              </Link>
              <div className="mt-1 border-t pt-1">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-[245px] shrink-0 border-r border-admin-border bg-white md:block">
          <nav className="py-4">
            {NAV.map((item) => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} />
            ))}

            <div className="mt-1">
              <div className="flex items-center gap-2.5 px-5 py-3 text-sm font-medium text-gray-700">
                <span className="w-[18px] text-center text-xs opacity-70">⚙</span>
                Basic Settings
              </div>
              <div className="ml-[41px] space-y-0.5 border-l border-admin-border pl-3">
                {SETTINGS_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg py-2 pl-3 text-[13px] ${
                      isActive(item.href)
                        ? "bg-[#F3F3F3] font-medium text-gray-900"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <NavItem
              href="/dashboard/account/settings"
              label="My Profile"
              icon="◍"
              active={isActive("/dashboard/account/settings")}
            />
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-6 py-8 sm:px-10">
          {children}
          <footer className="mt-16 pb-6 text-xs text-gray-400">
            Admin 1.0.7 · Software by JobsNearMe
          </footer>
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mx-2 flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-medium ${
        active ? "bg-[#F3F3F3] text-gray-900" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="w-[18px] text-center text-xs opacity-70">{icon}</span>
      {label}
    </Link>
  );
}
