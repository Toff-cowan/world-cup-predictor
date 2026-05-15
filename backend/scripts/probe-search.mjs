const key = "2kD9zRYRT7xN6kSGs6EoHcvSyKOyK0B4YaKTf1Ygeaw8PM6bgfR6SQ==";
const base = "https://cxm-api.fifa.com/fifacxmsearch/api";

const attempts = [
  { url: `${base}/search?q=world+cup+2026+teams`, headers: { "X-Fusion-Search-Key": key } },
  { url: `${base}/v1/search?query=teams`, headers: { "api-key": key } },
  { url: `${base}/content/search?term=worldcup`, headers: { "Ocp-Apim-Subscription-Key": key } },
];

for (const a of attempts) {
  const r = await fetch(a.url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: "https://www.fifa.com",
      Referer: "https://www.fifa.com/",
      "User-Agent": "Mozilla/5.0",
      ...a.headers,
    },
  });
  console.log(a.url, r.status, (await r.text()).slice(0, 300));
}

// POST search
const r2 = await fetch(`${base}/search`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Origin: "https://www.fifa.com",
    Referer: "https://www.fifa.com/",
    "X-Fusion-Search-Key": key,
  },
  body: JSON.stringify({ query: "world cup 2026 teams", language: "en" }),
});
console.log("POST search", r2.status, (await r2.text()).slice(0, 500));
