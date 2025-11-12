import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AppRoutes from "./Routes";
import ThemeToggle from "./components/ThemeToggle";
import StarBackground from "./components/StarBackground";
import BottomNav from "./components/ui/BottomNav";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Background star field */}
      <StarBackground />

      {/* Theme toggle button */}
      <ThemeToggle />

      {/* App content layered above background */}
      <div className="relative z-10 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* All other routes (must include /user-login, /user-signup, /user-registration) */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </div>
      {/* Bottom navigation for small screens */}
      <BottomNav />
    </div>
  );
}

export default App;
