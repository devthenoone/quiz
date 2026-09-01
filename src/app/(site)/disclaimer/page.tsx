import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Important disclaimers about the information published on JobsNearMe.",
};

const LAST_UPDATED = "September 1, 2026";

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Disclaimer</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <div className="article mt-6 text-[17px] text-gray-800">
        <h2>General information only</h2>
        <p>
          The guides, articles, and search results on JobsNearMe are provided for general
          informational purposes only. They do not constitute professional, legal, financial,
          or immigration advice, and should not be relied on as a substitute for advice from a
          qualified professional or official government source.
        </p>

        <h2>No employment guarantee</h2>
        <p>
          JobsNearMe is not a recruiter, employer, or job board, and does not guarantee that
          any position, employer, work permit, or visa outcome described or found through this
          site is available, legitimate, or accurate. Always verify job postings and employers
          directly through official channels before applying or providing personal
          information.
        </p>

        <h2>Third-party and search content</h2>
        <p>
          Search results are provided by Google&apos;s Programmable Search Engine and may
          surface content from third-party websites we do not own, control, or endorse. We
          are not responsible for the accuracy, legality, or safety of any external site or
          listing.
        </p>

        <h2>Advertising disclosure</h2>
        <p>
          This site displays advertising through Google AdSense for Search, including a
          related-search ad unit. We may earn revenue when you interact with these ads. This
          does not influence the editorial content of our guides, and the ads themselves are
          served and selected by Google, not by us.
        </p>

        <h2>Accuracy of information</h2>
        <p>
          While we try to keep our guides current, job markets, application processes, and
          requirements change frequently. We make no warranty that information on this site
          is complete, accurate, or up to date at the time you read it.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about this disclaimer? <Link href="/contact" className="text-brand hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
