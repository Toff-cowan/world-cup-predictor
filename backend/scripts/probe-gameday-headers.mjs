const r = await fetch("https://www.fifa.com/static/js/main.6b7ff68b.js", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const js = await r.text();
const idx = js.indexOf("gameday-prod");
console.log("hits:", (js.match(/gameday-prod/g) || []).length);
let pos = 0;
let n = 0;
while ((pos = js.indexOf("gameday", pos)) !== -1 && n < 15) {
  console.log(js.slice(pos, pos + 250).replace(/\s+/g, " "));
  pos += 7;
  n++;
}
