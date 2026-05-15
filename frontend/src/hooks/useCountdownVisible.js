import { useState } from "react";

const STORAGE_KEY = "wc-countdown-visible";

function readVisible() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) !== "false";
}

export function useCountdownVisible() {
  const [visible, setVisible] = useState(readVisible);

  const hide = () => {
    localStorage.setItem(STORAGE_KEY, "false");
    setVisible(false);
  };

  const show = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(true);
  };

  return { visible, hide, show };
}
