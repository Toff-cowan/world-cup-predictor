/** FIFA World Cup brand-inspired header themes (stable per post id). */
export const FIFA_HEADER_THEMES = [
  { bg: "#326295", text: "#ffffff", badge: "#ffd100", badgeText: "#000000" },
  { bg: "#00a651", text: "#ffffff", badge: "#ffd100", badgeText: "#000000" },
  { bg: "#ffd100", text: "#000000", badge: "#326295", badgeText: "#ffffff" },
  { bg: "#e4002b", text: "#ffffff", badge: "#ffd100", badgeText: "#000000" },
  { bg: "#0047FF", text: "#ffffff", badge: "#ffd100", badgeText: "#000000" },
  { bg: "#000000", text: "#ffffff", badge: "#00a651", badgeText: "#ffffff" },
];

export function fifaHeaderThemeForId(id) {
  const n = typeof id === "number" ? id : String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return FIFA_HEADER_THEMES[Math.abs(n) % FIFA_HEADER_THEMES.length];
}

export function randomFifaHeaderTheme() {
  return FIFA_HEADER_THEMES[Math.floor(Math.random() * FIFA_HEADER_THEMES.length)];
}
