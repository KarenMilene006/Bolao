require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3001;
const TOKEN = process.env.FOOTBALL_DATA_TOKEN;

if (!TOKEN) {
  console.error("❌ Defina FOOTBALL_DATA_TOKEN no .env");
  process.exit(1);
}


app.use("/api/football", async (req, res) => {
  try {
   
    const path = req.path.replace(/^\/+/, "");
    const qs = new URLSearchParams(req.query).toString();

    const apiUrl = `https://api.football-data.org/v4/${path}${qs ? `?${qs}` : ""}`;

    console.log("📡 Chamando:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: { "X-Auth-Token": TOKEN },
    });

    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }

    if (!response.ok) {
      console.error("❌ API respondeu erro:", response.status, payload);
      return res.status(response.status).json(payload);
    }

    res.json(payload);
  } catch (error) {
    console.error("❌ Erro proxy:", error);
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
