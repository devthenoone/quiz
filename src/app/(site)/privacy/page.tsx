import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How JobsNearMe collects, uses, and protects information, including data handled by Google Search and Google AdSense.",
};

const LAST_UPDATED = "September 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <div className="article mt-6 text-[17px] text-gray-800">
        <p>
          This Privacy Policy explains what information JobsNearMe (&quot;we&quot;,
          &quot;us&quot;) collects when you visit this site, how it is used, and the
          choices you have. By using this site, you agree to the practices described
          below.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Search queries.</strong> When you use the search box on this site, your
            query is sent to Google&apos;s Programmable Search Engine to return results. We
            do not store your search queries ourselves.
          </li>
          <li>
            <strong>Usage data.</strong> Standard technical information (such as pages
            visited, browser type, and approximate location derived from IP address) may be
            collected automatically via cookies described below.
          </li>
          <li>
            <strong>Contact form.</strong> If you submit our contact form, we receive the
            name, email address, and message you provide, solely to respond to your
            inquiry.
          </li>
          <li>
            <strong>Account data.</strong> This site does not offer public account
            registration. Only site administrators have login credentials, used solely to
            manage published content.
          </li>
        </ul>

        <h2>Third-party services</h2>
        <p>
          This site uses the following Google services, each governed by Google&apos;s own
          privacy policy:
        </p>
        <ul>
          <li>
            <strong>Google Programmable Search Engine</strong> — powers the on-site search
            box and returns web search results.
          </li>
          <li>
            <strong>Google AdSense for Search (Related Search for Content)</strong> — may
            display related-search suggestions and ads alongside search results and within
            articles. Google may use cookies to personalize the ads you see.
          </li>
        </ul>
        <p>
          You can learn how Google collects and uses data at{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            policies.google.com/privacy
          </a>
          , and manage ad personalization at{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            adssettings.google.com
          </a>
          .
        </p>

        <h2>Cookies</h2>
        <p>
          Cookies may be set by this site and by the third-party services above to keep the
          site working correctly, remember preferences, and support advertising. You can
          disable cookies in your browser settings, though some site features (such as
          search) may not work as expected without them.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          This site is not directed at children under 13, and we do not knowingly collect
          personal information from children.
        </p>

        <h2>Data retention</h2>
        <p>
          We retain contact form submissions only as long as needed to respond to your
          inquiry. We do not sell personal information to third parties.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on your location, you may have the right to request access to,
          correction of, or deletion of personal data we hold about you. Contact us using
          the details below to make such a request.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes take effect once
          posted on this page, with the &quot;Last updated&quot; date revised accordingly.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this policy? <Link href="/contact" className="text-brand hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
