import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// External URL for the dedicated genome web app (subdomain).
// Override with VITE_GENOME_APP_URL in production once the subdomain is live.
const GENOME_APP_URL = (
  (import.meta.env.VITE_GENOME_APP_URL as string | undefined) || "/genome-app/"
).replace(/\/$/, "");

type DropdownItem = {
  href: string;
  label: string;
  /** Render the entry indented under the previous item (e.g. an in-page anchor). */
  indent?: boolean;
};

type NavItem =
  | { kind: "link"; href: string; label: string }
  | { kind: "dropdown"; label: string; items: DropdownItem[] };

const WHITEPAPER_ITEMS: DropdownItem[] = [
  { href: "/whitepaper",                        label: "White Paper" },
  { href: "/whitepaper#heritage",               label: "I.   The Heritage",          indent: true },
  { href: "/whitepaper#quantum-grammar",        label: "II.  The Quantum Grammar",   indent: true },
  { href: "/whitepaper#macro-scale",            label: "III. The Macro Scale",       indent: true },
  { href: "/whitepaper#synthesis",              label: "IV.  The Synthesis",         indent: true },
  { href: "/whitepaper#frontier",               label: "V.   The Frontier",          indent: true },
  { href: "/whitepaper#horizon",                label: "VI.  The Empirical Horizon", indent: true },
  { href: "/whitepaper#references",             label: "Selected References",        indent: true },
  { href: "/whitepaper/original-contributions", label: "Original Contributions" },
];

const MEDIA_ITEMS: DropdownItem[] = [
  { href: "/blog",    label: "Blog" },
  { href: "/podcast", label: "Podcast" },
  { href: "/book",    label: "Book" },
];

const NAV_ITEMS: NavItem[] = [
  { kind: "link",     href: "/",        label: "Home" },
  { kind: "dropdown", label: "White Paper", items: WHITEPAPER_ITEMS },
  { kind: "link",     href: "/overview", label: "Overview" },
  { kind: "link",     href: "/app",     label: "Participate" },
  { kind: "link",     href: "/explore", label: "Explore Beliefs" },
  { kind: "dropdown", label: "Media",   items: MEDIA_ITEMS },
  { kind: "link",     href: "/support", label: "Support" },
  { kind: "link",     href: "/about",   label: "About" },
];

/**
 * Splits "/whitepaper#horizon" into ["/whitepaper", "horizon"]. Returns hash="" if absent.
 */
function splitHashHref(href: string): { path: string; hash: string } {
  const i = href.indexOf("#");
  return i < 0 ? { path: href, hash: "" } : { path: href.slice(0, i), hash: href.slice(i + 1) };
}

/**
 * Smart link for dropdown entries: if href contains "#", do SPA-friendly
 * scrolling — same-page hash clicks scroll smoothly without reload, and
 * cross-page navigation routes through wouter then scrolls once mounted.
 */
function DropdownEntry({
  item,
  active,
  onClose,
  className,
}: {
  item: DropdownItem;
  active: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [, setLocation] = useLocation();
  const { path, hash } = splitHashHref(item.href);

  const baseClass = cn(
    "block px-4 py-2.5 text-sm leading-snug transition-colors hover:bg-foreground/5",
    item.indent && "pl-9 text-[13px]",
    active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground",
    className,
  );

  if (!hash) {
    return (
      <Link href={path} onClick={onClose} className={baseClass}>
        {item.label}
      </Link>
    );
  }

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onClose();
    const onPath = window.location.pathname === path;
    if (onPath) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `${path}#${hash}`);
    } else {
      setLocation(path);
      // Wait for the route to mount, then scroll. The page also re-runs its
      // own on-mount hash check, so this is belt-and-suspenders.
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `${path}#${hash}`);
      }, 60);
    }
  };

  return (
    <a href={item.href} onClick={handleHashClick} className={baseClass}>
      {item.label}
    </a>
  );
}

function GenomeAuthButton() {
  // The Belief Genome web app now lives on its own subdomain. The marketing
  // site no longer holds session state — we just send users to the standalone
  // app (which handles its own login/registration).
  return (
    <div className="flex items-center gap-2">
      <a
        href={`${GENOME_APP_URL}/login`}
        className="px-4 py-2 rounded-lg border border-primary/30 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        Sign In
      </a>
      <a
        href={`${GENOME_APP_URL}/register`}
        className="px-4 py-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Get Started
      </a>
    </div>
  );
}

function NavDropdown({
  label,
  items,
  location,
  align = "left",
}: {
  label: string;
  items: DropdownItem[];
  location: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = items.some((i) => location === i.href || location.startsWith(i.href + "/"));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-close when route changes
  useEffect(() => { setOpen(false); }, [location]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary relative py-2 flex items-center gap-1 whitespace-nowrap",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
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
            className={cn(
              "absolute top-full mt-2 min-w-[260px] max-w-[420px] bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-xl shadow-foreground/20 py-2 z-50",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {items.map((item) => {
              const { path } = splitHashHref(item.href);
              const active = location === path || location.startsWith(path + "/");
              return (
                <DropdownEntry
                  key={item.href}
                  item={item}
                  active={active}
                  onClose={() => setOpen(false)}
                />
              );
            })}
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
            ? "bg-background/95 border-border shadow-lg shadow-foreground/10 py-4"
            : "bg-background/90 border-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          <Link href="/" className="group shrink-0">
            <span className="font-display text-sm font-light text-muted-foreground tracking-wide group-hover:text-foreground/80 transition-colors">
              Belief Genome Project
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {NAV_ITEMS.map((item, idx) => {
              if (item.kind === "link") {
                const active = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary relative py-2 whitespace-nowrap",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              }
              // Right-align the last dropdown to keep its panel on screen.
              const align = idx > NAV_ITEMS.length / 2 ? "right" : "left";
              return (
                <NavDropdown
                  key={item.label}
                  label={item.label}
                  items={item.items}
                  location={location}
                  align={align}
                />
              );
            })}
            <GenomeAuthButton />
          </nav>

          <button
            className="lg:hidden p-3 -mr-2 text-foreground active:scale-90 transition-transform"
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
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 pb-8 flex flex-col lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-3 pb-8">
              {NAV_ITEMS.map((item) =>
                item.kind === "link" ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "py-2 text-xl font-display font-semibold transition-colors",
                      location === item.href ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div key={item.label} className="pt-3">
                    <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground mb-2">
                      {item.label}
                    </div>
                    <ul className="space-y-0.5 pl-1">
                      {item.items.map((sub) => {
                        const { path } = splitHashHref(sub.href);
                        const active =
                          location === path || location.startsWith(path + "/");
                        return (
                          <li key={sub.href}>
                            <DropdownEntry
                              item={sub}
                              active={active}
                              onClose={() => setMobileMenuOpen(false)}
                              className={cn(
                                "py-2 text-base font-medium",
                                sub.indent && "pl-6 text-sm",
                                active ? "text-primary" : "text-foreground/80 hover:text-foreground",
                              )}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
              )}

              <div className="w-12 h-px bg-border my-4" />
              <GenomeAuthButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
