import { writeFileSync } from "fs";

const r = await fetch("https://www.fifa.com/static/js/main.6b7ff68b.js", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const js = await r.text();

const pathRe = /["'](\/(?:v\d+\/)?[a-zA-Z][a-zA-Z0-9_\-\/]{3,80})["']/g;
const paths = new Set();
let m;
while ((m = pathRe.exec(js)) !== null) {
  const p = m[1];
  if (/team|stand|match|group|season|compet|world|calendar|fixture|stage/i.test(p)) {
    paths.add(p);
  }
}
console.log([...paths].sort().join("\n"));

const urlRe = /https:\/\/[a-zA-Z0-9.-]+\.fifa\.com[a-zA-Z0-9_\-/.?=&]*/g;
const urls = new Set();
while ((m = urlRe.exec(js)) !== null) urls.add(m[0]);
writeFileSync("fifa-urls.txt", [...urls].sort().join("\n"));
console.log("urls written", urls.size);
