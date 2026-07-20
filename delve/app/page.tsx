import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProcessSection from "@/components/ProcessSection";
import SourcesSection from "@/components/SourcesSection";
import OutputsSection from "@/components/OutputsSection";
import FinalCta from "@/components/FinalCta";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink">
      <Nav />
      <Hero />
      <ProcessSection />
      <SourcesSection />
      <OutputsSection />
      <FinalCta />
    </main>
  );
}
