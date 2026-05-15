/** FIFA picture API — size "1" returns empty; sq-3 / sq-2 work. */
export const FIFA_FLAG_FORMATS = [
  { format: "sq", size: "3" },
  { format: "sq", size: "2" },
  { format: "4by3", size: "3" },
  { format: "4by3", size: "2" },
];

export function buildFifaFlagUrl(countryCode, format = "sq", size = "3") {
  const code = countryCode?.toUpperCase().replace(/[^A-Z]/g, "");
  if (!code) return null;
  return `https://api.fifa.com/api/v3/picture/flags-${format}-${size}/${code}`;
}

export function fifaFlagUrlsToTry(countryCode) {
  return FIFA_FLAG_FORMATS.map(({ format, size }) =>
    buildFifaFlagUrl(countryCode, format, size)
  );
}
