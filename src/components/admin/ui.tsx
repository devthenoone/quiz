"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Page header: title + subtitle + breadcrumb, used at the top of every
// dashboard page.
// ---------------------------------------------------------------------------
export function PageHeader({
  title,
  subtitle,
  crumbs,
  action,
}: {
  title: string;
  subtitle: string;
  crumbs: { label: string; href?: string }[];
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold text-gray-900">
          {title} <span className="text-base font-normal text-gray-500">{subtitle}</span>
        </h1>
        <nav className="mt-1 text-xs text-gray-400">
          {crumbs.map((c, i) => (
            <span key={c.label}>
              {i > 0 && " / "}
              {c.href ? (
                <Link href={c.href} className="text-admin-crimson hover:underline">
                  {c.label}
                </Link>
              ) : (
                c.label
              )}
            </span>
          ))}
        </nav>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60";

export function CrimsonButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`${buttonBase} bg-admin-crimson text-white hover:bg-admin-crimson-dark ${className}`}
    >
      {children}
    </button>
  );
}

export function GradientButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`${buttonBase} bg-gradient-to-r from-admin-purple to-admin-purple-dark text-white hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}

export function GradientLinkButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} bg-gradient-to-r from-admin-purple to-admin-purple-dark text-white hover:opacity-90 ${className}`}
    >
      {children}
    </Link>
  );
}

export function DarkButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`${buttonBase} bg-admin-navy text-white hover:bg-black ${className}`}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  tone = "gray",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "gray" | "red" | "green";
}) {
  const tones = {
    gray: "border-gray-300 text-gray-600 hover:bg-gray-50",
    red: "border-red-300 text-red-600 hover:bg-red-50",
    green: "border-green-300 text-green-600 hover:bg-green-50",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-semibold transition ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function OutlineLinkButton({
  href,
  children,
  tone = "gray",
  className = "",
}: {
  href: string;
  children: ReactNode;
  tone?: "gray" | "red" | "green";
  className?: string;
}) {
  const tones = {
    gray: "border-gray-300 text-gray-600 hover:bg-gray-50",
    red: "border-red-300 text-red-600 hover:bg-red-50",
    green: "border-green-300 text-green-600 hover:bg-green-50",
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-xs font-semibold transition ${tones[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Form field: label / underline input / helper text
// ---------------------------------------------------------------------------
export function FormField({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-admin-crimson"> *</span>}
      </span>
      {children}
      {help && <span className="mt-1.5 block text-xs text-gray-400">{help}</span>}
    </label>
  );
}

const underlineInput =
  "w-full border-0 border-b border-admin-border bg-transparent px-0 py-2 text-sm text-gray-900 outline-none focus:border-admin-crimson";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${underlineInput} ${props.className ?? ""}`} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`${underlineInput} resize-y ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${underlineInput} bg-white ${props.className ?? ""}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-admin-crimson" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
        style={{ height: 18, width: 18 }}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}

export function ToggleField({
  label,
  help,
  checked,
  onChange,
  children,
}: {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          {help && <p className="mt-0.5 text-xs text-gray-400">{help}</p>}
        </div>
        <Toggle checked={checked} onChange={onChange} label={label} />
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Warning banner
// ---------------------------------------------------------------------------
export function WarningBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Badge / pill
// ---------------------------------------------------------------------------
const badgeTones = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
}) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// KPI stat card
// ---------------------------------------------------------------------------
export function KpiCard({
  value,
  label,
  gradient,
}: {
  value: number | string;
  label: string;
  gradient: "purple" | "pink";
}) {
  const bg =
    gradient === "purple"
      ? "bg-gradient-to-br from-admin-purple to-admin-purple-dark"
      : "bg-gradient-to-br from-admin-pink to-admin-pink-dark";
  return (
    <div className={`rounded-2xl ${bg} p-6 text-center text-white shadow-sm`}>
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-white/90">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart panel shell: white card with a colored header bar
// ---------------------------------------------------------------------------
export function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
      <div className="bg-[#B9C3D9] px-4 py-2.5 text-sm font-semibold text-gray-800">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table card shell: colored header strip + content
// ---------------------------------------------------------------------------
export function TableCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-white">
      <div className="bg-[#B9C3D9] px-4 py-2.5 text-sm font-semibold text-gray-800">
        {title}
      </div>
      {children}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  function makeHref(p: number) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-border px-4 py-3 text-xs text-gray-500">
      <span>
        Showing {start}–{end} of {total} entries
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Link
            href={makeHref(Math.max(1, page - 1))}
            className="rounded-md border border-gray-200 px-2.5 py-1 hover:bg-gray-50"
          >
            Prev.
          </Link>
          {pages.map((p) => (
            <Link
              key={p}
              href={makeHref(p)}
              className={`rounded-md px-2.5 py-1 ${
                p === page
                  ? "bg-admin-crimson text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
          <Link
            href={makeHref(Math.min(totalPages, page + 1))}
            className="rounded-md border border-gray-200 px-2.5 py-1 hover:bg-gray-50"
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
