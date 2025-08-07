import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AnnouncementBar } from "@/components/announcement-bar";
import Homepage from "@/pages/homepage";
import Automations from "@/pages/automations";
import Chat from "@/pages/chat";
import TestAccordion from "@/pages/test-accordion";
import Results from "@/pages/results";
import Admin from "@/pages/admin";
import BotTest from "@/pages/bot-test";
import { PastProjectsPage } from "@/pages/past-projects";
import SheetsAdmin from "@/pages/sheets-admin";
import AnalysisLoading from "@/pages/analysis-loading";
import AIAgentExpert from "@/pages/ai-agent-expert";
import FreeBuild from "@/pages/free-build";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Homepage} />
      <Route path="/automations" component={Automations} />
      <Route path="/chat" component={Chat} />
      <Route path="/test-accordion" component={TestAccordion} />
      <Route path="/results" component={Results} />
      <Route path="/admin" component={Admin} />
      <Route path="/bot-test" component={BotTest} />
      <Route path="/past-projects" component={PastProjectsPage} />
      <Route path="/sheets-admin" component={SheetsAdmin} />
      <Route path="/loading" component={AnalysisLoading} />
      <Route path="/ai-agent-expert" component={AIAgentExpert} />
      <Route path="/free-build" component={FreeBuild} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <div className="flex-1">
              <Router />
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
