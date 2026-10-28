import fs from "node:fs/promises";
import sharp from "sharp";
const f = "public/assets/wii/resources.json";
const m = JSON.parse(await fs.readFile(f));
const pending = m.covers.filter((c) => !c.path);
const u = new URL("https://en.wikipedia.org/w/api.php");
u.search = new URLSearchParams({
  action: "query",
  format: "json",
  titles: pending
    .map((c) => decodeURIComponent(c.source.split("/wiki/")[1]))
    .join("|"),
  prop: "imageinfo",
  iiprop: "url|size",
});
const pages = Object.values((await (await fetch(u)).json()).query.pages);
for (const c of pending) {
  const info = pages.find(
    (p) =>
      p.title ===
      decodeURIComponent(c.source.split("/wiki/")[1]).replaceAll("_", " "),
  )?.imageinfo?.[0];
  if (!info) continue;
  const r = await fetch(info.url);
  console.log(c.id, r.status, r.headers.get("retry-after"));
  if (!r.ok) continue;
  await sharp(Buffer.from(await r.arrayBuffer()))
    .webp({ quality: 93 })
    .toFile(`public/images/wii/${c.id}.webp`);
  const meta = await sharp(`public/images/wii/${c.id}.webp`).metadata();
  Object.assign(c, {
    path: `/images/wii/${c.id}.webp`,
    width: meta.width,
    height: meta.height,
    status: "source-verified-rights-reserved",
  });
  delete c.reason;
  await new Promise((r) => setTimeout(r, 3000));
}
await fs.writeFile(f, JSON.stringify(m, null, 2));
await fs.writeFile(
  "src/data/wii-covers.json",
  JSON.stringify(m.covers, null, 2),
);
