export default async function handler(req, res) {
  try {
    const q = req.query || {};
    const lang = String(q.lang || "en").toLowerCase(); // en | ar
    const limit = Math.min(Math.max(parseInt(q.limit || "5", 10), 3), 8);
    const title = String(q.title || (lang === "ar" ? "أعلى تحركات" : "Top Movers"));
    const subtitle = String(
      q.subtitle || (lang === "ar" ? "لقطة مباشرة – بتتحدث تلقائيًا" : "Live snapshot – auto-updated")
    );
    const ctaText = String(q.cta_text || (lang === "ar" ? "اتداول دلوقتي" : "Trade now"));
    const ctaUrl = String(q.cta_url || "amana://top-movers");
    const uid = String(q.uid || ""); // optional personalization token

    const url =
      "https://mobilebackend.amanalabs.net/api/v1/top-movers?Industry=460,461";
    const r = await fetch(url);
    const data = await r.json();
    const arr = Array.isArray(data) ? data : [];

    const gainers = arr
      .filter((x) => typeof x?.perc === "number" && x.perc > 0)
      .sort((a, b) => b.perc - a.perc)
      .slice(0, limit);

    const losers = arr
      .filter((x) => typeof x?.perc === "number" && x.perc < 0)
      .sort((a, b) => a.perc - b.perc)
      .slice(0, limit);

    const format = String(q.format || "").toLowerCase();
    if (format !== "svg") {
      res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=60");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(200).send(JSON.stringify(arr));
    }

    const esc = (s) =>
      String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const pctStr = (p) => (p > 0 ? "+" : "") + p.toFixed(2) + "%";

    const row = (x, i, x0, y0, color, isTop) => {
      const name = esc(x.symbol || x.category || "—");
      const p = typeof x?.perc === "number" ? x.perc : 0;
      const pct = esc(pctStr(p));
      const y = y0 + i * 46;

      // Pulse للـ top item بس
      const anim = isTop
        ? ` <animate attributeName="opacity" values="1;0.75;1" dur="1.4s" repeatCount="indefinite" /> `
        : "";

      const arrow = p > 0 ? "▲" : "▼";

      return `
        <g>
          <text x="${x0}" y="${y}" fill="#fff" font-size="22" font-family="Arial">${name}</text>
          <text x="${x0 + 360}" y="${y}" fill="${color}" font-size="22" font-family="Arial" text-anchor="end" font-weight="${
            isTop ? "700" : "400"
          }">
            ${esc(arrow)} ${pct}
            ${anim}
          </text>
        </g>
      `;
    };

    // RTL support for Arabic title/subtitle only
    const isRTL = lang === "ar";
    const titleX = 60;
    const titleAnchor = "start";

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628" viewBox="0 0 1200 628">
  <defs>
    <!-- Soft glow -->
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feColorMatrix type="matrix" values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 0.55 0" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Header shimmer -->
    <linearGradient id="shimmer" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      <animate attributeName="x1" values="-1;1" dur="2.6s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="0;2" dur="2.6s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="628" fill="#0e0a28"/>

  <!-- Title -->
  <text x="${titleX}" y="78" fill="#fff" font-size="46" font-family="Arial" font-weight="800" text-anchor="${titleAnchor}">
    ${esc(title)}
  </text>
  <text x="${titleX}" y="112" fill="#b8b4d6" font-size="18" font-family="Arial" text-anchor="${titleAnchor}">
    ${esc(subtitle)}
  </text>

  <!-- Shimmer overlay on top area -->
  <rect x="0" y="0" width="1200" height="130" fill="url(#shimmer)"/>

  <!-- Cards -->
  <g filter="url(#glow)">
    <rect x="50" y="140" width="540" height="420" rx="18" fill="#15123a"/>
    <rect x="610" y="140" width="540" height="420" rx="18" fill="#15123a"/>
  </g>

  <!-- Headers -->
  <text x="85" y="198" fill="#00e3a2" font-size="26" font-family="Arial" font-weight="800">
    ${esc(lang === "ar" ? "الأعلى صعودًا" : "Top Gainers")}
  </text>
  <text x="645" y="198" fill="#ff4b6b" font-size="26" font-family="Arial" font-weight="800">
    ${esc(lang === "ar" ? "الأعلى هبوطًا" : "Top Losers")}
  </text>

  <!-- Rows -->
  ${gainers.map((x, i) => row(x, i, 85, 255, "#00e3a2", i === 0)).join("")}
  ${losers.map((x, i) => row(x, i, 645, 255, "#ff4b6b", i === 0)).join("")}

  <!-- CTA button (visual) -->
  <g>
    <rect x="915" y="565" width="235" height="44" rx="14" fill="#7c41ff"/>
    <text x="1032" y="594" fill="#fff" font-size="18" font-family="Arial" font-weight="800" text-anchor="middle">
      ${esc(ctaText)}
    </text>
  </g>

  <!-- Personalization footer -->
  <text x="60" y="604" fill="#8b87a8" font-size="15" font-family="Arial">
    ${esc(lang === "ar" ? "تحديث تلقائي" : "Auto-updated")}
    ${uid ? esc(" • UID: " + uid) : ""}
  </text>

  <!-- Small hint url (optional) -->
  <text x="1140" y="604" fill="#6f6a93" font-size="13" font-family="Arial" text-anchor="end">
    ${esc(ctaUrl)}
  </text>
</svg>`.trim();

    res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=60");
    return res.status(200).send(svg);
  } catch (e) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(500).send("svg error: " + String(e));
  }
}
