import fetch from "node-fetch";
import { createCanvas } from "canvas";

const API_URL =
  "https://mobilebackend.amanalabs.net/api/v1/top-movers?Industry=460,461";

export default async function handler(req, res) {
  try {
    const r = await fetch(API_URL);
    const data = await r.json();

    const gainers = data
      .filter(x => x.perc > 0)
      .sort((a,b)=>b.perc-a.perc)
      .slice(0,6);

    const losers = data
      .filter(x => x.perc < 0)
      .sort((a,b)=>a.perc-b.perc)
      .slice(0,6);

    const canvas = createCanvas(1200, 628);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0e0a28";
    ctx.fillRect(0,0,1200,628);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Arial";
    ctx.fillText("Top Movers", 50, 70);

    ctx.font = "26px Arial";
    ctx.fillStyle = "#00e3a2";
    gainers.forEach((x,i)=>{
      ctx.fillText(
        `${x.symbol || x.category} +${x.perc.toFixed(2)}%`,
        50,
        140 + i*50
      );
    });

    ctx.fillStyle = "#ff4b6b";
    losers.forEach((x,i)=>{
      ctx.fillText(
        `${x.symbol || x.category} ${x.perc.toFixed(2)}%`,
        650,
        140 + i*50
      );
    });

    res.setHeader("Content-Type","image/png");
    res.setHeader("Cache-Control","public, max-age=60");
    res.status(200).send(canvas.toBuffer());

  } catch (e) {
    res.status(500).send("error");
  }
}

