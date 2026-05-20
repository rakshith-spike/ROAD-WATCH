import React from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";

import App from "./app/App";
import { AuthProvider } from "./providers/AuthProvider";
import { PlatformProvider } from "./providers/PlatformProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PlatformProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </PlatformProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
