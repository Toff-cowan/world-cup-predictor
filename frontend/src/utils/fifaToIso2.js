/** FIFA 3-letter codes → ISO 3166-1 alpha-2 (flagcdn.com). WC 2026 teams. */
export const FIFA_TO_ISO2 = {
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CHI: "cl",
  COL: "co",
  COD: "cd",
  CPV: "cv",
  CRO: "hr",
  CIV: "ci",
  CUW: "cw",
  CZE: "cz",
  DEN: "dk",
  ECU: "ec",
  EGY: "eg",
  ENG: "gb-eng",
  ESP: "es",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  HAI: "ht",
  IRN: "ir",
  IRQ: "iq",
  ITA: "it",
  JOR: "jo",
  JPN: "jp",
  KOR: "kr",
  KSA: "sa",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NOR: "no",
  NZL: "nz",
  PAN: "pa",
  PAR: "py",
  POR: "pt",
  QAT: "qa",
  RSA: "za",
  SCO: "gb-sct",
  SEN: "sn",
  SUI: "ch",
  SWE: "se",
  TUN: "tn",
  TUR: "tr",
  URU: "uy",
  USA: "us",
  UZB: "uz",
  WAL: "gb-wls",
};

function normalizeAlpha(code) {
  return `${code || ""}`.toUpperCase().replace(/[^A-Z]/g, "");
}

export function fifaCodeToIso2(code) {
  const key = normalizeAlpha(code);
  return FIFA_TO_ISO2[key] || null;
}

/** Resolve ISO 3166-1 alpha-2 (or flagcdn subregion slug) from FIFA 3-letter or ISO 2-letter codes. */
export function resolveFlagIso2(countryCode, teamCode) {
  for (const raw of [countryCode, teamCode]) {
    if (!raw) continue;
    const key = normalizeAlpha(raw);
    if (!key) continue;
    if (key.length === 2) return key.toLowerCase();
    const iso = FIFA_TO_ISO2[key];
    if (iso) return iso;
  }
  return null;
}
