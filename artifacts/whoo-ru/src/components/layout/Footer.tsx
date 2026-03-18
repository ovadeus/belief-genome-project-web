import { Link } from "wouter";
import { Twitter, Linkedin, Github } from "lucide-react";
import { useGetPublicSettings } from "@workspace/api-client-react";

export function Footer() {
  const { data: settings } = useGetPublicSettings();

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-1 group inline-block">
              <span className="font-display text-3xl font-bold text-foreground tracking-tight">
                WhooRU
              </span>
              <span className="font-display text-3xl font-bold text-primary">
                ?
              </span>
            </Link>
            <p className="text-muted-foreground text-lg max-w-md font-display leading-relaxed">
              {settings?.tagline || "The only question that has ever really mattered."}
            </p>
            <div className="flex items-center gap-4">
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border">
                  <Twitter size={18} />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border">
                  <Linkedin size={18} />
                </a>
              )}
              {settings?.githubUrl && (
                <a href={settings.githubUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border border-border">
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-6 font-display uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About the Research</Link></li>
              <li><Link href="/app" className="text-muted-foreground hover:text-primary transition-colors">Desktop App</Link></li>
              <li><Link href="/book" className="text-muted-foreground hover:text-primary transition-colors">The Book</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-6 font-display uppercase tracking-wider text-sm">Connect</h4>
            <ul className="space-y-4">
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Read the Blog</Link></li>
              <li><Link href="/subscribe" className="text-muted-foreground hover:text-primary transition-colors">Newsletter</Link></li>
              <li><Link href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors">Admin Login</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WhooRU. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
