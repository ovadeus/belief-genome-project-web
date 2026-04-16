import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GenomeAuthProvider } from "./components/genome/GenomeAuthContext";
import { ExploreProvider } from "./components/genome/ExploreContext";
import GenomeLayout from "./components/genome/GenomeLayout";
import LoginPage from "./pages/genome/LoginPage";
import RegisterPage from "./pages/genome/RegisterPage";
import ProbePage from "./pages/genome/ProbePage";
import DashboardPage from "./pages/genome/DashboardPage";
import DnaPage from "./pages/genome/DnaPage";
import AnalyzePage from "./pages/genome/AnalyzePage";
import SyncPage from "./pages/genome/SyncPage";
import ProfilePage from "./pages/genome/ProfilePage";

const queryClient = new QueryClient();

function RootRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/dashboard", { replace: true });
  }, [setLocation]);
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
        <GenomeLayout><ProbePage /></GenomeLayout>
      </Route>
      <Route path="/dashboard">
        <GenomeLayout><DashboardPage /></GenomeLayout>
      </Route>
      <Route path="/dna">
        <GenomeLayout><DnaPage /></GenomeLayout>
      </Route>
      <Route path="/analyze">
        <GenomeLayout><AnalyzePage /></GenomeLayout>
      </Route>
      <Route path="/sync">
        <GenomeLayout><SyncPage /></GenomeLayout>
      </Route>
      <Route path="/profile">
        <GenomeLayout><ProfilePage /></GenomeLayout>
      </Route>
      <Route path="/"><RootRedirect /></Route>
      <Route><NotFound /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GenomeAuthProvider>
        <ExploreProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </ExploreProvider>
      </GenomeAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
