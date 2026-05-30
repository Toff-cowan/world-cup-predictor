import { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "wc-countdown-visible";

function readVisible() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "false";
}

const CountdownVisibilityContext = createContext(null);

export function CountdownVisibilityProvider({ children }) {
  const [visible, setVisible] = useState(readVisible);

  const hide = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "false");
    setVisible(false);
  }, []);

  const show = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(true);
  }, []);

  const value = useMemo(
    () => ({ visible, hide, show }),
    [visible, hide, show]
  );

  return (
    <CountdownVisibilityContext.Provider value={value}>
      {children}
    </CountdownVisibilityContext.Provider>
  );
}

export function useCountdownVisibility() {
  const ctx = useContext(CountdownVisibilityContext);
  if (!ctx) {
    throw new Error("useCountdownVisibility must be used within CountdownVisibilityProvider");
  }
  return ctx;
}
