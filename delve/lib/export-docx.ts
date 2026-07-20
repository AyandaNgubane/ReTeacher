import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { ResearchDossier } from "./types";

export async function exportDossierToDocx(dossier: ResearchDossier) {
  const children: Paragraph[] = [
    new Paragraph({
      text: dossier.topic,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Research dossier generated ${new Date(dossier.generatedAt).toLocaleString()}`,
          italics: true,
          color: "888888",
          size: 18,
        }),
      ],
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: "Overview",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      text: dossier.overview,
      spacing: { after: 300 },
    }),
  ];

  dossier.findings.forEach((finding, idx) => {
    children.push(
      new Paragraph({
        text: `${idx + 1}. ${finding.subtopicTitle}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200 },
      }),
      new Paragraph({
        text: finding.briefing,
        spacing: { after: 150 },
      })
    );

    if (finding.sources.length) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "Sources", bold: true, size: 20 })],
          spacing: { after: 80 },
        })
      );
      finding.sources.forEach((s, i) => {
        const label =
          s.type === "video"
            ? `Video — ${(s as any).channel ?? "YouTube"}`
            : s.type === "book"
            ? `Book — ${(s as any).authors?.join(", ") ?? "Unknown author"}`
            : `Article${(s as any).source ? ` — ${(s as any).source}` : ""}`;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[${i + 1}] ${s.title} ` }),
              new TextRun({ text: `(${label})`, italics: true, color: "666666" }),
            ],
            spacing: { after: 20 },
          }),
          new Paragraph({
            children: [new TextRun({ text: s.url, color: "1155CC", underline: {} })],
            spacing: { after: 100 },
          })
        );
      });
    }
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: {
          run: { font: "Georgia", size: 22 },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${slugify(dossier.topic)}-dossier.docx`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
