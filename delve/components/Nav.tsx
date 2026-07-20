import Link from "next/link";

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-ink/70 border-b border-brass/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <CompassMark />
          <span className="font-display text-xl tracking-tight text-parchment">Delve</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/learn"
            className="stamp text-xs text-brass border border-brass/40 px-4 py-2 hover:bg-brass hover:text-ink transition-colors duration-300"
          >
            Start Research
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function CompassMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`w-7 h-7 text-brass ${className}`}
      fill="none"
      stroke="currentColor"
    >
      <circle cx="20" cy="20" r="17" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="1.6" fill="currentColor" stroke="none" />
      <path d="M20 6 L23 20 L20 34 L17 20 Z" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" />
      <path d="M20 20 L26 14 M20 20 L14 26" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
