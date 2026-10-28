import fs from "node:fs/promises";
import sharp from "sharp";
const rows = [
  ["psp", "PSP", "Sony", "2004", "PSP-3000-Silver.png"],
  ["ps1", "PlayStation", "Sony", "1994", "PSX-Console-wController.png"],
  ["ps2", "PlayStation 2", "Sony", "2000", "PS2-Versions.png"],
  ["ps3", "PlayStation 3", "Sony", "2006", "PS3-Fat-Console-Set.png"],
  ["ps4", "PlayStation 4", "Sony", "2013", "PS4-Console-wDS4.png"],
  ["ps5", "PlayStation 5", "Sony", "2020", "PlayStation_5_and_DualSense.png"],
  ["vita", "PS Vita", "Sony", "2011", "PlayStation-Vita-1101-FL.png"],
  ["nes", "NES", "Nintendo", "1983", "NES-Console-Set.png"],
  ["snes", "Super Nintendo", "Nintendo", "1990", "SNES-Mod1-Console-Set.png"],
  ["n64", "Nintendo 64", "Nintendo", "1996", "N64-Console-Set.png"],
  ["gamecube", "GameCube", "Nintendo", "2001", "GameCube-Console-Set.png"],
  ["wii", "Wii", "Nintendo", "2006", "Wii-Console.png"],
  ["wiiu", "Wii U", "Nintendo", "2012", "Wii-U-Console-Set.png"],
  [
    "switch",
    "Nintendo Switch",
    "Nintendo",
    "2017",
    "Nintendo-Switch-Console-Docked-wJoyConRB.png",
  ],
  ["gb", "Game Boy", "Nintendo", "1989", "Game-Boy-FL.png"],
  [
    "gbc",
    "Game Boy Color",
    "Nintendo",
    "1998",
    "Nintendo-Game-Boy-Color-FL.png",
  ],
  [
    "gba",
    "Game Boy Advance",
    "Nintendo",
    "2001",
    "Nintendo-Game-Boy-Advance-Purple-FL.png",
  ],
  ["ds", "Nintendo DS", "Nintendo", "2004", "Nintendo-DS-Fat-Blue.png"],
  ["3ds", "Nintendo 3DS", "Nintendo", "2011", "Nintendo-3DS-AquaOpen.png"],
  ["master", "Master System", "Sega", "1985", "Sega-Master-System-Set.png"],
  ["genesis", "Mega Drive", "Sega", "1988", "Sega-Genesis-Mk2-6button.png"],
  ["saturn", "Sega Saturn", "Sega", "1994", "Sega-Saturn-Console-Set-Mk1.png"],
  ["dreamcast", "Dreamcast", "Sega", "1998", "Dreamcast-Console-Set.png"],
  ["xbox", "Xbox", "Microsoft", "2001", "Xbox-Console-Set.png"],
  ["xbox360", "Xbox 360", "Microsoft", "2005", "Xbox-360-Pro-wController.png"],
  ["atari", "Atari 2600", "Atari", "1977", "Atari-2600-Wood-4Sw-Set.png"],
];
await fs.mkdir("public/consoles", { recursive: true });
const clean = (s) => s?.replace(/<[^>]*>/g, "").trim() || "";
const out = [];
const api = new URL("https://commons.wikimedia.org/w/api.php");
api.search = new URLSearchParams({
  action: "query",
  format: "json",
  titles: rows.map((r) => `File:${r[4]}`).join("|"),
  prop: "imageinfo",
  iiprop: "url|extmetadata|size",
  redirects: "1",
  iilimit: "1",
});
const batch = await (await fetch(api)).json();
const pages = Object.values(batch.query.pages);
for (const [id, name, brand, year, file] of rows) {
  const record = {
    id,
    name,
    brand,
    year,
    model: file.replace(".png", ""),
    path: null,
    format: null,
    width: null,
    height: null,
    source: `https://commons.wikimedia.org/wiki/File:${file}`,
    license: null,
    licenseUrl: null,
    author: null,
    alt: `${name}, consola original de ${brand}`,
    status: "pending",
    reason: "Recurso pendiente de verificación",
  };
  try {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
      action: "query",
      format: "json",
      titles: `File:${file}`,
      prop: "imageinfo",
      iiprop: "url|extmetadata|size",
      redirects: "1",
    });
    const info = pages.find(
      (p) =>
        p.title.replaceAll("_", " ") === `File:${file}`.replaceAll("_", " "),
    )?.imageinfo?.[0];
    if (!info) {
      record.source = null;
      throw Error("Archivo no encontrado; fuente autorizada pendiente");
    }
    const meta = info.extmetadata;
    record.license = clean(meta.LicenseShortName?.value);
    record.licenseUrl = meta.LicenseUrl?.value || null;
    record.author = clean(meta.Artist?.value);
    record.source = info.descriptionurl;
    if (!/public domain|CC0|CC BY(-SA)? /i.test(record.license))
      throw Error("Licencia no autorizada automáticamente");
    let input;
    try {
      input = await fs.readFile(`public/consoles/${id}.webp`);
    } catch {
      if (process.env.CONSOLES_OFFLINE)
        throw Error(
          "Descarga pendiente: Wikimedia respondió HTTP 429; Retry-After: 600 segundos",
        );
      await new Promise((r) => setTimeout(r, 3500));
      const response = await fetch(info.url);
      if (!response.ok)
        throw Error(
          `Descarga HTTP ${response.status}; reintentar después de ${response.headers.get("retry-after") || 600} segundos`,
        );
      input = Buffer.from(await response.arrayBuffer());
    }
    const stats = await sharp(input).stats();
    if (stats.isOpaque) throw Error("No tiene transparencia real");
    const path = `public/consoles/${id}.webp`;
    await sharp(input)
      .trim()
      .resize({
        width: 1200,
        height: 900,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toFile(path);
    const result = await sharp(path).metadata();
    Object.assign(record, {
      path: `/consoles/${id}.webp`,
      format: "WebP",
      width: result.width,
      height: result.height,
      status: "ready",
      reason:
        "Fotografía recortada, redimensionada y convertida a WebP; alfa verificado",
    });
  } catch (e) {
    record.reason = e.message;
  }
  console.log(id, record.status, record.reason);
  out.push(record);
}
await fs.writeFile(
  "public/consoles/manifest.json",
  JSON.stringify(out, null, 2),
);
await fs.mkdir("src/data", { recursive: true });
await fs.writeFile("src/data/consoles.json", JSON.stringify(out, null, 2));
