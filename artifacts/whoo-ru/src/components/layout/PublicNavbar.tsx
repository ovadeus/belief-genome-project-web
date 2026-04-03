import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenomeAuth } from "@/components/genome/GenomeAuthContext";

const TOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Participate" },
  { href: "/explore", label: "Explore Beliefs" },
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book" },
];

const MORE_LINKS = [
  { href: "/support", label: "Support" },
  { href: "/mindmap", label: "Mind Map" },
  { href: "/scoring", label: "Scoring & Weights" },
  { href: "/about", label: "About" },
];

const ALL_MORE_HREFS = MORE_LINKS.map(item => item.href);

function GenomeAuthButton() {
  const { user, logout } = useGenomeAuth();
  const [, setLocation] = useLocation();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/genome/dashboard"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-border">|</span>
        <span className="text-xs text-muted-foreground">{user.name}</span>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 active:scale-95 transition-all"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/genome/login"
        className="px-4 py-2 rounded-lg border border-primary/30 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/genome/register"
        className="px-4 py-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}

function MoreDropdown({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = ALL_MORE_HREFS.some(h => location === h);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary relative py-2 flex items-center gap-1",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        More
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 min-w-[200px] bg-[#0c1025]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl shadow-black/30 py-2 z-50"
          >
            {MORE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 text-sm transition-colors hover:bg-white/5",
                  location === item.href ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PublicNavbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b backdrop-blur-xl",
          isScrolled 
            ? "bg-[#06091a]/[0.98] border-border shadow-lg shadow-black/20 py-4" 
            : "bg-[#06091a]/[0.94] border-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="group">
            <span className="font-display text-sm font-light text-muted-foreground tracking-wide group-hover:text-foreground/80 transition-colors">
              Belief Genome Project
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {TOP_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  location === link.href ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
                {location === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
            <MoreDropdown location={location} />
            <GenomeAuthButton />
          </nav>

          <button 
            className="md:hidden p-3 -mr-2 text-foreground active:scale-90 transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-4 pb-8 flex flex-col md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-5 items-center justify-center flex-1">
              {TOP_LINKS.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "text-2xl font-display font-semibold transition-colors",
                    location === link.href ? "text-primary" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="w-12 h-px bg-border my-2" />

              {MORE_LINKS.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "text-2xl font-display font-semibold transition-colors",
                    location === item.href ? "text-primary" : "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className="w-12 h-px bg-border my-2" />
              <div className="mt-4">
                <GenomeAuthButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
