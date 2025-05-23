import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
    </main>
  );
}
