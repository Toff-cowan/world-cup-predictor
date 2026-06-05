const FIFA_PLUS_API = "https://cxm-api.fifa.com/fifaplusweb/api";
const FIFA_SITE = "https://www.fifa.com";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  Origin: FIFA_SITE,
  Referer: `${FIFA_SITE}/en/news`,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function fixFifaText(value) {
  if (!value || typeof value !== "string") return value;
  return value.replace(/Γäó/g, "™").replace(/\r\n/g, "\n").trim();
}

export async function fifaPlusGet(path) {
  const url = path.startsWith("http") ? path : `${FIFA_PLUS_API}${path}`;
  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FIFA Plus API ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

function richtextToPlain(node) {
  if (!node) return "";
  if (node.nodeType === "text") return node.value || "";
  if (Array.isArray(node.content)) {
    return node.content.map(richtextToPlain).join("");
  }
  return "";
}

export function articleBodyFromRichtext(richtext) {
  if (!richtext?.content) return "";
  const parts = [];
  for (const block of richtext.content) {
    if (block.nodeType === "paragraph" || block.nodeType?.startsWith("heading")) {
      const text = fixFifaText(richtextToPlain(block));
      if (text) parts.push(text);
    }
  }
  return parts.join("\n\n");
}

export function mapNewsListItem(item) {
  const slug = item.slug;
  const path = item.articlePageUrl || `/en/articles/${slug}`;
  return {
    externalId: item.entryId,
    slug,
    title: fixFifaText(item.title),
    summary: fixFifaText(item.previewText || ""),
    tag: fixFifaText(item.roofline || item.tags?.[0] || "News"),
    roofline: fixFifaText(item.roofline || ""),
    imageUrl: item.image?.src || null,
    sourceUrl: path.startsWith("http") ? path : `${FIFA_SITE}${path}`,
    publishedAt: item.publishedDate || null,
  };
}

export async function fetchLatestNewsItems(limit = 40) {
  const page = await fifaPlusGet("/pages/news?locale=en");
  const newsSections = (page.sections || []).filter((s) => s.entryType === "news");

  const items = [];
  const seen = new Set();
  const perSectionLimit = Math.max(limit, 30);

  for (const section of newsSections) {
    const endpoint = section.entryEndpoint?.startsWith("/")
      ? section.entryEndpoint
      : `/${section.entryEndpoint}`;
    const sep = endpoint.includes("?") ? "&" : "?";
    const data = await fifaPlusGet(`${endpoint}${sep}limit=${perSectionLimit}`);
    for (const item of data.items || []) {
      if (seen.has(item.entryId)) continue;
      seen.add(item.entryId);
      items.push(mapNewsListItem(item));
    }
  }

  return items
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, limit);
}

export async function fetchArticleBody(externalId) {
  const data = await fifaPlusGet(`/sections/article/${externalId}?locale=en`);
  return articleBodyFromRichtext(data.richtext);
}
