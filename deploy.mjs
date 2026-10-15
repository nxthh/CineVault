import fs from "node:fs";

const pages = [
  "index.html",
  "movies.html",
  "tv-shows.html",
  "details.html",
  "my-list.html",
  "404.html",
];
fs.mkdirSync("dist", { recursive: true });
for (const page of pages) {
  const html = fs
    .readFileSync(page, "utf8")
    .replace(/dist\/styles\.css/g, "styles.css")
    .replace(/dist\/main\.js/g, "main.js");
  fs.writeFileSync(`dist/${page}`, html);
}
for (const file of ["robots.txt", "sitemap.xml"])
  fs.copyFileSync(file, `dist/${file}`);
