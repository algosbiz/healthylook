import { readFileSync, writeFileSync } from "node:fs";

const groups = JSON.parse(readFileSync("scratch-results-data.json", "utf8"));

const DEV_ORIGIN = "http://localhost:3006";

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const sections = groups
  .map((g) => {
    const cards = g.paths
      .map((p, i) => {
        const filename = p.split("/").pop();
        return `
        <figure class="card">
          <img src="${DEV_ORIGIN}${p}" alt="" loading="lazy" onerror="this.closest('.card').classList.add('broken')" />
          <figcaption>
            <span class="idx">${String(i + 1).padStart(2, "0")}</span>
            <span class="fname">${escapeHtml(filename)}</span>
          </figcaption>
        </figure>`;
      })
      .join("");
    return `
      <section class="group">
        <h2>${escapeHtml(g.label)} <span class="count">${g.paths.length} images</span></h2>
        <div class="grid">${cards}</div>
      </section>`;
  })
  .join("");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Before/After results audit</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 24px 32px 80px; font: 14px/1.4 -apple-system, Segoe UI, sans-serif; background: #faf8f5; color: #2b2118; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #7a6f63; margin: 0 0 28px; }
  .group { margin-bottom: 40px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #e2d9cc; padding-bottom: 8px; margin-bottom: 14px; }
  .count { font-weight: 400; text-transform: none; letter-spacing: 0; color: #a08f7a; margin-left: 8px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  .card { margin: 0; background: #fff; border: 1px solid #e2d9cc; border-radius: 6px; overflow: hidden; }
  .card img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; background: #efe8dc; }
  .card.broken img { opacity: 0.15; }
  .card.broken::after { content: "failed to load — is the dev server running?"; display: block; padding: 6px; font-size: 10px; color: #b33; }
  figcaption { display: flex; gap: 6px; align-items: baseline; padding: 6px 8px; font-size: 11px; }
  .idx { color: #a08f7a; font-variant-numeric: tabular-nums; }
  .fname { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
</head>
<body>
  <h1>Before/After results — visual audit</h1>
  <p class="sub">Every image currently in src/data/results.ts, grouped and labeled by filename. Open this file in a browser while <code>npm run dev</code> is running on port 3006. Scan each row for near-duplicate shots, then send back the filenames to remove.</p>
  ${sections}
</body>
</html>`;

writeFileSync("results-audit.html", html);
console.log("wrote results-audit.html —", groups.reduce((n, g) => n + g.paths.length, 0), "images across", groups.length, "groups");
