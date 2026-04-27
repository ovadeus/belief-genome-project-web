import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";

// Pages
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Methodology from "./pages/Methodology";
import Dimensions from "./pages/Dimensions";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/app/Dashboard";
import Billing from "./pages/app/Billing";
import Account from "./pages/app/Account";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display text-6xl font-bold tracking-tight mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found.</p>
      </div>
    </PublicLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/dimensions" component={Dimensions} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      
      {/* App Shell */}
      <Route path="/app/dashboard" component={Dashboard} />
      <Route path="/app/billing" component={Billing} />
      <Route path="/app/account" component={Account} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
