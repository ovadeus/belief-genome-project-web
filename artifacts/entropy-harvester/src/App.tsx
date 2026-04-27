import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function ComingSoon() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-xl">
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
          Entropy Harvester
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          A survey instrument that preserves superposition.
        </p>
        <p className="mt-8 text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Coming soon
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={ComingSoon} />
      <Route component={ComingSoon} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
