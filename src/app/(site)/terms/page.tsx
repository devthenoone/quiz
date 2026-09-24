import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms and conditions for using the Quizy Zone website.",
};

const LAST_UPDATED = "September 1, 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <div className="article mt-6 text-[17px] text-gray-800">
        <p>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of
          Quizy Zone (&quot;we&quot;, &quot;us&quot;, the &quot;site&quot;). By using this
          site, you agree to these Terms. If you do not agree, please do not use the site.
        </p>

        <h2>Use of the site</h2>
        <p>
          Quizy Zone publishes free quizzes, trivia, and informational articles for
          entertainment and learning, and provides a search box powered by Google
          Programmable Search. You agree to use the site only
          for lawful purposes and not to misuse, disrupt, or attempt unauthorized access to
          any part of it.
        </p>

        <h2>Entertainment and educational use</h2>
        <p>
          Quizy Zone&apos;s quizzes are provided for entertainment and general learning only.
          Scores and results are not an official assessment, certification, or measure of
          ability, and should not be relied on for exams, competitions, or professional
          decisions. We do not offer prizes, and we never ask you to pay to play a quiz.
        </p>

        <h2>Search results and third-party links</h2>
        <p>
          Search results on this site are returned by Google&apos;s Programmable Search
          Engine and may link to external websites we do not control or operate, including
          third-party reference and trivia sites. We are not responsible for the content,
          accuracy, or practices of any third-party site.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The text, layout, and design of Quizy Zone&apos;s own articles and pages are owned
          by us or our licensors and may not be reproduced without permission, except for
          personal, non-commercial use.
        </p>

        <h2>Disclaimer of warranties</h2>
        <p>
          This site and its content are provided &quot;as is&quot; without warranties of any
          kind, express or implied. We do not warrant that the site will be error-free,
          uninterrupted, or that information is complete, accurate, or current.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Quizy Zone shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of this site
          or reliance on its content.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may revise these Terms at any time. Continued use of the site after changes are
          posted constitutes acceptance of the revised Terms.
        </p>

        <h2>Contact us</h2>
        <p>
          Questions about these Terms? <Link href="/contact" className="text-brand hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
