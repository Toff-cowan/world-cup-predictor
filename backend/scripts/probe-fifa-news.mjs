const base = "https://cxm-api.fifa.com/fifaplusweb/api";
const res = await fetch(`${base}/sections/article/40BL74KafReOlLUItJ5cc5?locale=en`, {
  headers: {
    Accept: "application/json",
    Origin: "https://www.fifa.com",
    Referer: "https://www.fifa.com/en/news",
  },
});
console.log(JSON.stringify(await res.json(), null, 2).slice(0, 15000));
