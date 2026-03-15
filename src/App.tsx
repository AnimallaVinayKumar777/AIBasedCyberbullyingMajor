import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarNav } from "@/components/SidebarNav";
import { MobileNav } from "@/components/MobileNav";
import { RightSidebar } from "@/components/RightSidebar";
import { Composer } from "@/components/Composer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import "./lib/i18n";

const queryClient = new QueryClient();

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full">
      <div className="hidden md:block">
        <SidebarNav onComposeClick={() => setComposerOpen(true)} />
      </div>

      <main className="flex-1 min-w-0 border-x border-border max-w-2xl">
        {children}
      </main>

      <RightSidebar />

      <MobileNav />

      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <Layout>
                    <Home />
                  </Layout>
                }
              />
              <Route
                path="/profile"
                element={
                  <Layout>
                    <Profile />
                  </Layout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <Layout>
                    <Notifications />
                  </Layout>
                }
              />
              <Route
                path="/explore"
                element={
                  <Layout>
                    <Explore />
                  </Layout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
