import Link from "next/link";
import GoogleWordmark from "./GoogleWordmark";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "Guides", href: "/guides" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
];
const employers = [
  { label: "Post a Job", href: "/contact" },
  { label: "Browse Resumes", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Resources", href: "/guides" },
];
const support = [
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="text-lg font-extrabold">
            <span className="text-blue-600">Jobs</span>
            <span className="text-gray-900">NearMe</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Find jobs near you from top employers. Search thousands of job listings across
            all industries and locations.
          </p>
          <div className="mt-4 flex gap-2">
            {["f", "t", "in", "ig"].map((s) => (
              <span
                key={s}
                className="grid h-8 w-8 place-items-center rounded-full border text-xs font-bold text-gray-500"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <FooterCol title="Quick Links" links={quickLinks} />
        <FooterCol title="For Employers" links={employers} />
        <FooterCol title="Support" links={support} />

        <div>
          <h4 className="mb-3 text-sm font-bold text-gray-900">Newsletter</h4>
          <p className="text-sm text-gray-500">
            Subscribe to get the latest job updates and career tips.
          </p>
          <form action="#" className="mt-3 space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="bg-[#0b1b34] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row">
          <span>© {new Date().getFullYear()} JobsNearMe. All rights reserved.</span>
          <span>
            Enhanced by <GoogleWordmark />
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold text-gray-900">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-500">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith("/") ? (
              <Link href={l.href} className="hover:text-blue-600">
                {l.label}
              </Link>
            ) : (
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
