import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Storefront from "./pages/Storefront";
import AuthCallback from "./pages/AuthCallback";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/dashboard" component={Dashboard} /><Route path="/auth/callback" component={AuthCallback} /><Route path="/store/:slug" component={Storefront} /><Route component={Home} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
