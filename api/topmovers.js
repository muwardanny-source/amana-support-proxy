export default async function handler(req, res) {
  try {
    const url =
      "https://mobilebackend.amanalabs.net/api/v1/top-movers?Industry=460,461";

    const r = await fetch(url);
    const data = await r.json();

    // Optional: cache بسيط 60 ثانية
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=60");
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    res.status(200).send(JSON.stringify(data));
  } catch (e) {
    res.status(500).send(
      JSON.stringify({ error: "failed_to_fetch", message: String(e) })
    );
  }
}
