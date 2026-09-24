import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Quizy Zone — questions, feedback, corrections, or quiz topic requests.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Contact us</h1>
      <p className="mt-2 text-gray-600">
        Spotted a wrong answer, have feedback, or want a quiz on a topic we haven&apos;t
        covered yet? Send us a message.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_260px]">
        <ContactForm />

        <aside className="space-y-4 text-sm text-gray-600">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-1 font-semibold text-gray-900">Email</h2>
            <p>hello@quizyzone.example</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h2 className="mb-1 font-semibold text-gray-900">Response time</h2>
            <p>We usually reply within 1–2 business days.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
