export default async function handler(req, res) {
  try {
    const url =
      "https://mobilebackend.amanalabs.net/api/v1/top-movers?Industry=460,461";
    const r = await fetch(url);
    const data = await r.json();
    const arr = Array.isArray(data) ? data : [];

    const gainers = arr
      .filter((x) => typeof x?.perc === "number" && x.perc > 0)
      .sort((a, b) => b.perc - a.perc)
      .slice(0, 5);

    const losers = arr
      .filter((x) => typeof x?.perc === "number" && x.perc < 0)
      .sort((a, b) => a.perc - b.perc)
      .slice(0, 5);

    const format = (req.query?.format || "").toLowerCase();

    // لو طلبت SVG
    if (format === "svg") {
      const esc = (s) =>
        String(s ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");

      const row = (x, i, x0, y0, color) => {
        const name = esc(x.symbol || x.category || "—");
        const pct = (x.perc > 0 ? "+" : "") + x.perc.toFixed(2) + "%";
        const y = y0 + i * 46;
        return `
          <text x="${x0}" y="${y}" fill="#fff" font-size="22" font-family="Arial">${name}</text>
          <text x="${x0 + 360}" y="${y}" fill="${color}" font-size="22" font-family="Arial" text-anchor="end">${esc(pct)}</text>
        `;
      };

      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628">
  <rect width="1200" height="628" fill="#0e0a28"/>
  <text x="60" y="80" fill="#fff" font-size="44" font-family="Arial" font-weight="700">Top Movers</text>

  <rect x="50" y="120" width="540" height="460" rx="18" fill="#15123a"/>
  <rect x="610" y="120" width="540" height="460" rx="18" fill="#15123a"/>

  <text x="80" y="170" fill="#00e3a2" font-size="26" font-family="Arial" font-weight="700">Top Gainers</text>
  <text x="640" y="170" fill="#ff4b6b" font-size="26" font-family="Arial" font-weight="700">Top Losers</text>

  ${gainers.map((x, i) => row(x, i, 80, 220, "#00e3a2")).join("")}
  ${losers.map((x, i) => row(x, i, 640, 220, "#ff4b6b")).join("")}

  <text x="60" y="610" fill="#8b87a8" font-size="16" font-family="Arial">Auto-updated</text>
</svg>`.trim();

      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=60"
      );
      return res.status(200).send(svg);
    }

    // الافتراضي JSON
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=60");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(JSON.stringify(arr));
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: "failed", message: String(e) }));
  }
}
