/** Google search for a national team's football coverage. */
export function nationalTeamSearchUrl(teamName) {
  const query = `${teamName} national football team`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
