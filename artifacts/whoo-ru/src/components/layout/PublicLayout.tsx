import { ReactNode } from "react";
import { PublicNavbar } from "./PublicNavbar";
import { Footer } from "./Footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Global abstract subtle background noise/gradient could go here */}
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-[radial-gradient(circle_at_top_right,rgba(108,143,255,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.05),transparent_40%)]" />
      
      <PublicNavbar />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
