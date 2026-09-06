import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { LanguageProvider, useLang } from "./contexts/LanguageContext";
import { TooltipProvider } from "./components/ui/tooltip";
import MainContent from "./components/MainContent";
import QuranReader from "./components/QuranReader";
import Footer from "./components/Footer";
import ScrollButton from "./components/ScrollButton";
import Top_Head from "./components/Top_Head";
import SplashScreen from "./components/SplashScreen";
import NotFound from "./components/NotFound";
import { STORAGE } from "./data/constants";

/* ── Main app inner ──────────────────────────────────────────────── */
function AppInner() {
  const { isRtl } = useLang();

  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("splashShown") === "1"
  );
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(STORAGE.ACTIVE_TAB) || "prayer"
  );

  const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem("splashShown", "1");
    setSplashDone(true);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE.ACTIVE_TAB, tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}

      <Routes>
        <Route
          path="/"
          element={
            <div
              dir={isRtl ? "rtl" : "ltr"}
              style={{ opacity: splashDone ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
              className="min-h-dvh flex flex-col bg-background"
            >
              <Top_Head activeTab={activeTab} onTabChange={handleTabChange} />

              <main className="flex-1 flex justify-center w-full">
                <div className="w-full max-w-5xl px-4 pb-10">
                  {activeTab === "prayer" && <MainContent />}
                  {activeTab === "quran"  && <QuranReader />}
                </div>
              </main>

              <ScrollButton />
              <Footer />
            </div>
          }
        />
        <Route
          path="*"
          element={
            <div
              dir={isRtl ? "rtl" : "ltr"}
              className="min-h-dvh flex flex-col bg-background"
            >
              <Top_Head activeTab="prayer" />
              <NotFound />
              <Footer />
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          <AppInner />
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
