import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useThemeBootstrap } from "@/hooks/use-theme";

import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AppShowcase from "./pages/AppShowcase";
import Book from "./pages/Book";
import MindMap from "./pages/MindMap";
import ScoringWeighting from "./pages/ScoringWeighting";
import Support from "./pages/Support";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Subscribe from "./pages/Subscribe";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import BlogList from "./pages/admin/BlogList";
import BlogEditor from "./pages/admin/BlogEditor";
import AdminSubscribers from "./pages/admin/Subscribers";
import AdminEarlyBird from "./pages/admin/EarlyBird";
import AdminSettings from "./pages/admin/Settings";
import MediaLibrary from "./pages/admin/MediaLibrary";
import GenomeSubmissions from "./pages/admin/GenomeSubmissions";
import AdminAnalytics from "./pages/admin/Analytics";
import ExploreBeliefs from "./pages/ExploreBeliefs";
import NeuromapPage from "./pages/NeuromapPage";

import { usePageTracker } from "./hooks/use-page-tracker";

const queryClient = new QueryClient();

// External URL for the dedicated genome web app (subdomain). Override with
// VITE_GENOME_APP_URL in production once the subdomain is live.
const GENOME_APP_URL = (import.meta.env.VITE_GENOME_APP_URL as string | undefined) || "/genome-app/";

function GenomeRedirect({ path }: { path: string }) {
  // Redirect any legacy /genome/* URL to the standalone genome app.
  if (typeof window !== "undefined") {
    const target = `${GENOME_APP_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    window.location.replace(target);
  }
  return null;
}

function Router() {
  usePageTracker();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/app" component={AppShowcase} />
      <Route path="/book" component={Book} />
      <Route path="/mindmap" component={MindMap} />
      <Route path="/scoring" component={ScoringWeighting} />
      <Route path="/support" component={Support} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/explore" component={ExploreBeliefs} />
      <Route path="/neuromap/:key" component={NeuromapPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/blog" component={BlogList} />
      <Route path="/admin/blog/new" component={BlogEditor} />
      <Route path="/admin/blog/edit/:id" component={BlogEditor} />
      <Route path="/admin/subscribers" component={AdminSubscribers} />
      <Route path="/admin/earlybird" component={AdminEarlyBird} />
      <Route path="/admin/media" component={MediaLibrary} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/genome" component={GenomeSubmissions} />
      <Route path="/admin/analytics" component={AdminAnalytics} />

      {/* Legacy /genome/* paths now bounce to the standalone genome app. */}
      <Route path="/genome/:rest*">
        {(params) => <GenomeRedirect path={params.rest || ""} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useThemeBootstrap();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
