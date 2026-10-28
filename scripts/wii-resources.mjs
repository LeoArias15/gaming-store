import fs from "node:fs/promises";
import sharp from "sharp";
const titles = [
  "Super Mario Galaxy",
  "Mario Kart Wii",
  "The Legend of Zelda: Twilight Princess",
  "Wii Sports",
  "Super Smash Bros. Brawl",
  "New Super Mario Bros. Wii",
];
const ids = [
  "mario-galaxy",
  "mario-kart",
  "twilight-princess",
  "wii-sports",
  "smash-brawl",
  "new-mario",
];
await fs.mkdir("public/images/wii", { recursive: true });
await fs.mkdir("public/assets/wii", { recursive: true });
async function api(host, params) {
  const u = new URL(`https://${host}/w/api.php`);
  u.search = new URLSearchParams({
    action: "query",
    format: "json",
    ...params,
  });
  const r = await fetch(u);
  if (!r.ok) throw Error(`HTTP ${r.status}`);
  return (await r.json()).query.pages;
}
const pages = Object.values(
  await api("en.wikipedia.org", {
    titles: titles.join("|"),
    prop: "pageimages",
    piprop: "name",
    pilicense: "any",
    redirects: "1",
  }),
);
const files = Object.values(
  await api("en.wikipedia.org", {
    titles: pages.map((p) => "File:" + p.pageimage).join("|"),
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
  }),
);
const out = [];
for (let n = 0; n < titles.length; n++) {
  const p = pages.find((p) => p.title === titles[n]);
  const i = files.find(
    (f) => f.title === "File:" + p?.pageimage?.replaceAll("_", " "),
  )?.imageinfo?.[0];
  const row = {
    id: ids[n],
    title: titles[n],
    path: null,
    source: i?.descriptionurl || null,
    license: i?.extmetadata?.LicenseShortName?.value || null,
    rights:
      "Copyright del editor. La justificación de fair use de Wikipedia no constituye una licencia general de reutilización.",
    width: null,
    height: null,
    status: "pending",
  };
  try {
    if (!i) throw Error("Sin archivo");
    const r = await fetch(i.url);
    if (!r.ok) throw Error("HTTP " + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    const path = `public/images/wii/${ids[n]}.webp`;
    await sharp(buf).webp({ quality: 93 }).toFile(path);
    const m = await sharp(path).metadata();
    Object.assign(row, {
      path: `/images/wii/${ids[n]}.webp`,
      width: m.width,
      height: m.height,
      status: "source-verified-rights-reserved",
    });
  } catch (e) {
    row.reason = e.message;
  }
  out.push(row);
  console.log(row);
}
const logoSource =
  "https://raw.githubusercontent.com/simple-icons/simple-icons/11.15.0/icons/wii.svg";
const lr = await fetch(logoSource);
if (!lr.ok) throw Error(`Logo HTTP ${lr.status}`);
const logo = (await lr.text()).replace(
  'viewBox="0 0 24 24"',
  'viewBox="0 6.26 24 11.48" fill="#727981"',
);
await fs.writeFile("public/assets/wii/logo.svg", logo);
await fs.writeFile(
  "public/assets/wii/resources.json",
  JSON.stringify(
    {
      logo: {
        path: "/assets/wii/logo.svg",
        source: logoSource,
        license: "CC0-1.0 (Simple Icons); marca Wii de Nintendo",
      },
      covers: out,
    },
    null,
    2,
  ),
);
await fs.writeFile("src/data/wii-covers.json", JSON.stringify(out, null, 2));
