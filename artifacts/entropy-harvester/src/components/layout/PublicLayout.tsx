import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-8">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-display font-bold sm:inline-block">
                Entropy Harvester
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/methodology" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Methodology
              </Link>
              <Link href="/dimensions" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Dimensions
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="text-base">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-base">Sign up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-8 text-sm text-muted-foreground">
          <p>
            Built by <a href="https://bgpanalytics.com" target="_blank" rel="noreferrer" className="underline underline-offset-4 font-medium">BGPanalytics</a>.
          </p>
          <div className="flex gap-4">
            <Link href="/methodology" className="hover:underline underline-offset-4">Methodology</Link>
            <Link href="/dimensions" className="hover:underline underline-offset-4">Dimensions</Link>
            <Link href="/pricing" className="hover:underline underline-offset-4">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
