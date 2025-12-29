export default async function handler(req, res) {
  const url =
    "https://mobilebackend.amanalabs.net/api/v1/top-movers?Industry=460,461";

  const r = await fetch(url);
  const data = await r.json();

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(data));
}
