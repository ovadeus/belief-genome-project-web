import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { GenomeAuthProvider, useGenomeAuth } from "./components/genome/GenomeAuthContext";
import { ExploreProvider } from "./components/genome/ExploreContext";
import { ReflectionsModalProvider } from "./components/genome/ReflectionsModalContext";
import GenomeLayout from "./components/genome/GenomeLayout";
import LoginPage from "./pages/genome/LoginPage";
import RegisterPage from "./pages/genome/RegisterPage";
import ProbePage from "./pages/genome/ProbePage";
import { useThemeBootstrap } from "./hooks/use-theme";
import DashboardPage from "./pages/genome/DashboardPage";
import DnaPage from "./pages/genome/DnaPage";
import PublicDnaPage from "./pages/genome/PublicDnaPage";
import ComparePage from "./pages/genome/ComparePage";
import AnalyzePage from "./pages/genome/AnalyzePage";
import SyncPage from "./pages/genome/SyncPage";
import ProfilePage from "./pages/genome/ProfilePage";

const queryClient = new QueryClient();

const REDIRECT_KEY = "genome:redirectAfterLogin";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useGenomeAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      try {
        sessionStorage.setItem(REDIRECT_KEY, location);
      } catch {}
      setLocation("/login", { replace: true });
    }
  }, [loading, user, location, setLocation]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", background: "var(--app-bg)" }}>
        Loading…
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

function RootRedirect() {
  const [, setLocation] = useLocation();
  const { user, loading } = useGenomeAuth();
  useEffect(() => {
    if (loading) return;
    setLocation(user ? "/dashboard" : "/login", { replace: true });
  }, [loading, user, setLocation]);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold" style={{ color: "var(--ink-100)" }}>Page not found</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-300)" }}>
          <a href="/dashboard" style={{ textDecoration: "underline" }}>Go to your dashboard</a>
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login"><LoginPage /></Route>
      <Route path="/register"><RegisterPage /></Route>
      <Route path="/probe">
        <RequireAuth><GenomeLayout><ProbePage /></GenomeLayout></RequireAuth>
      </Route>
      <Route path="/dashboard">
        <RequireAuth><GenomeLayout><DashboardPage /></GenomeLayout></RequireAuth>
      </Route>
      {/* Auth-gated Compare — declared BEFORE /dna/:signature so the literal
          'compare' segment doesn't get swallowed as a signature. The library
          view (/dna/compare) and the compare-against-entry view
          (/dna/compare/:entryId) share one page component, two visual modes. */}
      <Route path="/dna/compare/:entryId">
        <RequireAuth><GenomeLayout><ComparePage /></GenomeLayout></RequireAuth>
      </Route>
      <Route path="/dna/compare">
        <RequireAuth><GenomeLayout><ComparePage /></GenomeLayout></RequireAuth>
      </Route>
      {/* Public, unauthenticated share page — MUST come before the protected
          /dna route, since wouter matches in declaration order. */}
      <Route path="/dna/:signature"><PublicDnaPage /></Route>
      <Route path="/dna">
        <RequireAuth><GenomeLayout><DnaPage /></GenomeLayout></RequireAuth>
      </Route>
      <Route path="/analyze">
        <RequireAuth><GenomeLayout><AnalyzePage /></GenomeLayout></RequireAuth>
      </Route>
      <Route path="/sync">
        <RequireAuth><GenomeLayout><SyncPage /></GenomeLayout></RequireAuth>
      </Route>
      <Route path="/profile">
        <RequireAuth><GenomeLayout><ProfilePage /></GenomeLayout></RequireAuth>
      </Route>
      <Route path="/"><RootRedirect /></Route>
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  useThemeBootstrap();
  return (
    <QueryClientProvider client={queryClient}>
      <GenomeAuthProvider>
        <ExploreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ReflectionsModalProvider>
              <Router />
            </ReflectionsModalProvider>
          </WouterRouter>
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </ExploreProvider>
      </GenomeAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
