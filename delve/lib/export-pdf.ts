import jsPDF from "jspdf";
import { ResearchDossier } from "./types";

const MARGIN = 56;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function exportDossierToPdf(dossier: ResearchDossier) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  let y = MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeParagraph = (text: string, fontSize: number, lineHeight: number, font: string = "helvetica", style: string = "normal") => {
    doc.setFont(font, style);
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      doc.text(line, MARGIN, y);
      y += lineHeight;
    });
  };

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text(dossier.topic, MARGIN, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Research dossier generated ${new Date(dossier.generatedAt).toLocaleString()}`,
    MARGIN,
    y
  );
  doc.setTextColor(0);
  y += 22;

  doc.setDrawColor(200, 155, 60);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 20;

  writeParagraph("Overview", 13, 16, "helvetica", "bold");
  y += 4;
  writeParagraph(dossier.overview, 10.5, 14.5);
  y += 12;

  dossier.findings.forEach((finding, idx) => {
    ensureSpace(50);
    writeParagraph(`${idx + 1}. ${finding.subtopicTitle}`, 13, 16, "helvetica", "bold");
    y += 4;
    writeParagraph(finding.briefing, 10.5, 14.5);
    y += 8;

    if (finding.sources.length) {
      ensureSpace(16);
      writeParagraph("Sources", 9.5, 12, "helvetica", "bold");
      finding.sources.forEach((s, i) => {
        const label =
          s.type === "video"
            ? `Video — ${(s as any).channel ?? "YouTube"}`
            : s.type === "book"
            ? `Book — ${(s as any).authors?.join(", ") ?? "Unknown author"}`
            : `Article${(s as any).source ? ` — ${(s as any).source}` : ""}`;
        writeParagraph(`[${i + 1}] ${s.title} (${label})`, 9, 12);
        writeParagraph(s.url, 8.5, 11, "courier");
      });
    }
    y += 14;
  });

  doc.save(`${slugify(dossier.topic)}-dossier.pdf`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
