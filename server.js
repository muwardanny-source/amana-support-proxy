import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());

const URL = "https://amana.app/company/contact-us";

app.get("/support-links", async (req, res) => {
  try {
    const r = await fetch(URL);
    const html = await r.text();
    const $ = cheerio.load(html);

    const links = [];
    $("a[href]").each((_, el) => {
      const h = $(el).attr("href");
      if (!h) return;
      links.push(h.startsWith("http") ? h : URL + h);
    });

    const find = (k) => links.find(l => l.toLowerCase().includes(k)) || null;

    res.json({
      whatsapp: find("whatsapp"),
      telegram: find("t.me"),
      messenger: find("m.me"),
      email: find("mailto")?.replace("mailto:", "")
    });
  } catch {
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000, () => {
  console.log("Server running on port 10000");
});
