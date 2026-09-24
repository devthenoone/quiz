import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Quizy Zone — fun, free quizzes and trivia on general knowledge, science, history, sports, movies, music, and more.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">About Quizy Zone</h1>

      <div className="article mt-6 text-[17px] text-gray-800">
        <p>
          Quizy Zone is a home for curious minds. Whether you want a quick brain teaser on
          your lunch break, questions for your next pub trivia night, or a fun way to revise
          for school, our quizzes make learning something new feel like a game.
        </p>

        <h2>What we do</h2>
        <p>
          We publish free quizzes and trivia across general knowledge, science, history,
          geography, sports, movies &amp; TV, music, and technology. Every quiz comes with
          clear answers and short explanations, so you learn a fun fact even when you get a
          question wrong.
        </p>

        <h2>Who it&apos;s for</h2>
        <ul>
          <li>Trivia lovers who want a fresh challenge every day</li>
          <li>Students looking for a fun way to test and revise what they&apos;ve learned</li>
          <li>Quiz hosts searching for ready-made questions for game night</li>
          <li>Families and friends who enjoy a bit of friendly competition</li>
        </ul>

        <h2>Our promise</h2>
        <p>
          Accurate, well-researched questions — no trick answers. We double-check every quiz
          and update it when facts change.
        </p>

        <p>
          Spotted a mistake or have a quiz topic you&apos;d like us to cover?{" "}
          <Link href="/contact" className="text-brand hover:underline">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
