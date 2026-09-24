import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Quizzes", href: "/guides" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const policies = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-extrabold">
          <span className="text-blue-600">Quizy</span>
          <span className="text-gray-900"> Zone</span>
        </Link>

        <div className="hidden items-center gap-1 text-sm font-medium text-gray-700 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded px-3 py-2 hover:text-blue-600">
              {l.label}
            </Link>
          ))}

          <Dropdown label="Policies" items={policies} />
        </div>
      </nav>
    </header>
  );
}

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 rounded px-3 py-2 hover:text-blue-600">
        {label}
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-56 translate-y-1 rounded-xl border bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
