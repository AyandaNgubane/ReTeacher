import { WebSource } from "./search";
import { VideoSource } from "./youtube";
import { BookSource } from "./books";

export type Source = WebSource | VideoSource | BookSource;

export type Subtopic = {
  id: string;
  title: string;
  angle: string;
};

export type SubtopicFinding = {
  subtopicId: string;
  subtopicTitle: string;
  briefing: string;
  sources: Source[];
};

export type ResearchDossier = {
  topic: string;
  generatedAt: string;
  overview: string;
  findings: SubtopicFinding[];
};

export type PodcastLine = {
  speaker: "Host" | "Guest";
  text: string;
};

export type PodcastScript = {
  title: string;
  lines: PodcastLine[];
};
