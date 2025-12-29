import fetch from "node-fetch";
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler() {
  const r = await fetch(
    "https://mobilebackend.amanalabs.net/api/v1/top-movers?Industry=460,461"
  );
  const data = await r.json();

  const gainers = data
    .filter(x => x.perc > 0)
    .sort((a,b)=>b.perc-a.perc)
    .slice(0,6);

  const losers = data
    .filter(x => x.perc < 0)
    .sort((a,b)=>a.perc-b.perc)
    .slice(0,6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "628px",
          background: "#0e0a28",
          color: "white",
          padding: "40px",
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: "bold" }}>
          Top Movers
        </div>

        <div style={{ display: "flex", marginTop: 40 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#00e3a2", fontSize: 26, marginBottom: 20 }}>
              Top Gainers
            </div>
            {gainers.map(x => (
              <div style={{ fo
