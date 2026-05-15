const r = await fetch("https://www.fifa.com/static/js/main.6b7ff68b.js", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const js = await r.text();
console.log("len", js.length);

const apiHits = [];
for (const needle of ["api.fifa.com", "cxm-api", "standings", "IdCompetition", "worldcup", "canadamexicousa"]) {
  let i = 0;
  while ((i = js.indexOf(needle, i)) !== -1) {
    apiHits.push(js.slice(Math.max(0, i - 40), i + 80).replace(/\s+/g, " "));
    i += needle.length;
    if (apiHits.length > 200) break;
  }
}
console.log("hits sample:", [...new Set(apiHits)].slice(0, 15));
