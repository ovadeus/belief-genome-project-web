import { PublicNavbar } from "@/components/layout/PublicNavbar";

export default function ScoringWeighting() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#06091a]">
      <div className="fixed top-0 left-0 right-0 z-[1000] bg-[#06091a]/90 backdrop-blur-md">
        <PublicNavbar />
      </div>
      <iframe
        src={`${import.meta.env.BASE_URL}scoring.html?embedded=1`}
        className="absolute inset-0 w-full h-full border-none outline-none"
        title="Scoring & Weighting System"
      />
    </div>
  );
}
