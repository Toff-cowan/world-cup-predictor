import { useEffect, useState } from "react";

const KICKOFF = new Date("2026-06-11T19:00:00Z");

function getTimeLeft(target) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const secs = Math.floor(diff / 1000);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    mins: Math.floor((secs % 3600) / 60),
    secs: secs % 60,
  };
}

export function useCountdown(targetDate = KICKOFF) {
  const [left, setLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return left;
}
