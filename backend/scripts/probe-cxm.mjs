const r = await fetch("https://www.fifa.com/static/js/main.6b7ff68b.js", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const js = await r.text();

const idx = js.indexOf("fifaplusweb/api");
const chunks = [];
let pos = 0;
while ((pos = js.indexOf("fifaplusweb", pos)) !== -1) {
  chunks.push(js.slice(pos, pos + 200));
  pos += 10;
  if (chunks.length > 30) break;
}
console.log(chunks.join("\n---\n"));

// search for path patterns after fifaplusweb
const re = /fifaplusweb\/api[^"']{0,120}/g;
console.log("\nPATHS:\n", [...new Set(js.match(re) || [])].slice(0, 20));
