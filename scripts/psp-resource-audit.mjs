import fs from "node:fs/promises";
const text = await fs.readFile("src/data/games.ts", "utf8");
const titles = [...text.matchAll(/title: "([^"]+)"/g)].map((m) => m[1]);
const api = new URL("https://en.wikipedia.org/w/api.php");
api.search = new URLSearchParams({
  action: "query",
  format: "json",
  titles: titles.join("|"),
  prop: "pageimages",
  piprop: "name",
  pilicense: "any",
  redirects: "1",
});
const data = await (await fetch(api)).json();
const pages = Object.values(data.query.pages);
const fileApi = new URL("https://en.wikipedia.org/w/api.php");
fileApi.search = new URLSearchParams({
  action: "query",
  format: "json",
  titles: pages
    .filter((p) => p.pageimage)
    .map((p) => "File:" + p.pageimage)
    .join("|"),
  prop: "imageinfo",
  iiprop: "url|extmetadata|size",
});
const files = Object.values((await (await fetch(fileApi)).json()).query.pages);
const rows = pages.map((p) => {
  const i = files.find(
    (f) => f.title === "File:" + p.pageimage?.replaceAll("_", " "),
  )?.imageinfo?.[0];
  return {
    title: p.title,
    requestedPlatform: "PSP",
    artworkVersion: "Sin verificar; puede pertenecer a otra edición",
    page: p.pageid > 0 ? "https://en.wikipedia.org/?curid=" + p.pageid : null,
    file: p.pageimage || null,
    source: i?.descriptionurl || null,
    license: i?.extmetadata?.LicenseShortName?.value || null,
    width: i?.width || null,
    height: i?.height || null,
    status: "pending",
    reason:
      "No se ha verificado autorización de reutilización fuera de Wikipedia; no integrado.",
  };
});
await fs.writeFile(
  "public/psp/resources.json",
  JSON.stringify(
    {
      logo: {
        path: "/psp/logo.svg",
        source: "https://commons.wikimedia.org/wiki/File:PSP_Logo.svg",
        license: "Public domain (PD-textlogo / PD-shape); marca PSP de Sony",
        author: "Afrank99",
        width: 753,
        height: 231,
      },
      covers: rows,
    },
    null,
    2,
  ),
);
console.log(
  rows.map((p) => ({ title: p.title, license: p.license, file: p.file })),
);
