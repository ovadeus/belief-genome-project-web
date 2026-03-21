import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AppShowcase from "./pages/AppShowcase";
import Book from "./pages/Book";
import Subscribe from "./pages/Subscribe";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import BlogList from "./pages/admin/BlogList";
import BlogEditor from "./pages/admin/BlogEditor";
import AdminSubscribers from "./pages/admin/Subscribers";
import AdminEarlyBird from "./pages/admin/EarlyBird";
import AdminSettings from "./pages/admin/Settings";
import MediaLibrary from "./pages/admin/MediaLibrary";

import { GenomeAuthProvider, useGenomeAuth } from "./components/genome/GenomeAuthContext";
import LoginPage from "./pages/genome/LoginPage";
import RegisterPage from "./pages/genome/RegisterPage";
import ProbePage from "./pages/genome/ProbePage";
import DashboardPage from "./pages/genome/DashboardPage";
import ProfilePage from "./pages/genome/ProfilePage";

const queryClient = new QueryClient();

function GenomeProtected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useGenomeAuth();
  const [, setLocation] = useLocation();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) { setLocation('/genome/login'); return null; }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/app" component={AppShowcase} />
      <Route path="/book" component={Book} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/blog" component={BlogList} />
      <Route path="/admin/blog/new" component={BlogEditor} />
      <Route path="/admin/blog/edit/:id" component={BlogEditor} />
      <Route path="/admin/subscribers" component={AdminSubscribers} />
      <Route path="/admin/earlybird" component={AdminEarlyBird} />
      <Route path="/admin/media" component={MediaLibrary} />
      <Route path="/admin/settings" component={AdminSettings} />

      <Route path="/genome/login" component={LoginPage} />
      <Route path="/genome/register" component={RegisterPage} />
      <Route path="/genome/probe">
        <GenomeProtected><ProbePage /></GenomeProtected>
      </Route>
      <Route path="/genome/dashboard">
        <GenomeProtected><DashboardPage /></GenomeProtected>
      </Route>
      <Route path="/genome/profile">
        <GenomeProtected><ProfilePage /></GenomeProtected>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GenomeAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </GenomeAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
