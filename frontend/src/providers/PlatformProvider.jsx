import { createContext, useContext } from "react";

import { useRoadWatchPlatform } from "../hooks/useRoadWatchPlatform";

const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {
  const platform = useRoadWatchPlatform();
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used inside PlatformProvider");
  return context;
}
