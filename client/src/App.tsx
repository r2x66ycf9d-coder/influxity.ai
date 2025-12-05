import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import EmailGenerator from "./pages/EmailGenerator";
import ContentGenerator from "./pages/ContentGenerator";
import DataAnalysis from "./pages/DataAnalysis";
import SalesCopy from "./pages/SalesCopy";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/email"} component={EmailGenerator} />
      <Route path={"/content"} component={ContentGenerator} />
      <Route path={"/analysis"} component={DataAnalysis} />
      <Route path={"/sales-copy"} component={SalesCopy} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
