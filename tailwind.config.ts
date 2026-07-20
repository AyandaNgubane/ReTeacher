"use client";

import { useState } from "react";
import { ResearchDossier } from "@/lib/types";
import { exportDossierToPdf } from "@/lib/export-pdf";
import { exportDossierToDocx } from "@/lib/export-docx";

export default function ExportBar({ dossier }: { dossier: ResearchDossier }) {
  const [busy, setBusy] = useState<"pdf" | "docx" | null>(null);

  const handlePdf = () => {
    setBusy("pdf");
    try {
      exportDossierToPdf(dossier);
    } finally {
      setBusy(null);
    }
  };

  const handleDocx = async () => {
    setBusy("docx");
    try {
      await exportDossierToDocx(dossier);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handlePdf}
        disabled={busy !== null}
        className="flex items-center gap-2 text-xs stamp px-4 py-2.5 border border-brass/40 text-brass hover:bg-brass hover:text-ink transition-colors disabled:opacity-40"
      >
        {busy === "pdf" ? "Building…" : "Download PDF"}
      </button>
      <button
        onClick={handleDocx}
        disabled={busy !== null}
        className="flex items-center gap-2 text-xs stamp px-4 py-2.5 border border-brass/40 text-brass hover:bg-brass hover:text-ink transition-colors disabled:opacity-40"
      >
        {busy === "docx" ? "Building…" : "Download DOCX"}
      </button>
    </div>
  );
}
