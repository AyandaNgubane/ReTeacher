"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const EXAMPLE_TOPICS = [
  "the Byzantine economy",
  "CRISPR gene editing",
  "the history of jazz",
  "orbital mechanics",
  "monetary policy",
  "coral reef ecosystems",
];

export default function Hero() {
  const [topicIndex, setTopicIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTopicIndex((i) => (i + 1) % EXAMPLE_TOPICS.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="stamp text-xs text-brass mb-6"
        >
          Field Research, Automated
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.04] text-parchment max-w-4xl"
        >
          Point it at{" "}
          <span className="relative inline-block whitespace-nowrap">
            <span className="text-brass italic">{EXAMPLE_TOPICS[topicIndex]}</span>
          </span>
          <br />
          it comes back with a dossier.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-lg text-parchment/65 max-w-xl leading-relaxed"
        >
          Name a topic, pick the angles you care about, and Delve pulls from
          articles, books, and video to assemble real research — then
          summarizes it, exports it, or turns it into a two-person podcast
          conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex items-center gap-5"
        >
          <Link
            href="/learn"
            className="group relative px-7 py-3.5 bg-brass text-ink font-medium overflow-hidden"
          >
            <span className="relative z-10">Start a dossier</span>
            <span className="absolute inset-0 bg-brass-bright translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#E0B65C]" />
          </Link>
          <a href="#how-it-works" className="text-sm text-parchment/60 underline-brass hover:text-parchment transition-colors">
            See how it works
          </a>
        </motion.div>
      </div>

      {/* Signature element: rotating compass with a settling needle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:block absolute -right-16 top-24 pointer-events-none"
        aria-hidden
      >
        <svg viewBox="0 0 400 400" className="w-[420px] h-[420px] text-brass/25">
          <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="0.5" fill="none" />
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const r1 = 170;
            const r2 = i % 9 === 0 ? 152 : 162;
            return (
              <line
                key={i}
                x1={200 + r1 * Math.cos(angle)}
                y1={200 + r1 * Math.sin(angle)}
                x2={200 + r2 * Math.cos(angle)}
                y2={200 + r2 * Math.sin(angle)}
                stroke="currentColor"
                strokeWidth="1"
              />
            );
          })}
          <g className="compass-spin origin-center text-brass/70" style={{ transformOrigin: "200px 200px" }}>
            <path d="M200 80 L214 200 L200 320 L186 200 Z" fill="currentColor" fillOpacity="0.5" />
          </g>
          <circle cx="200" cy="200" r="4" fill="currentColor" className="text-brass" />
        </svg>
      </motion.div>
    </section>
  );
}
