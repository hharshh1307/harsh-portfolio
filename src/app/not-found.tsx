import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-32 sm:px-6">
      <p className="label">404</p>
      <h1 className="display mt-4 text-6xl leading-none sm:text-8xl">
        Offside. <span className="italic">This page doesn&apos;t exist.</span>
      </h1>
      <p className="mt-8">
        <Link href="/" className="link">
          Back to the start
        </Link>
      </p>
    </div>
  );
}
