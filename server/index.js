require('dotenv').config();  // Adicione no topo
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const PORT = 3001;
const TOKEN = process.env.VITE_FOOTBALL_API;  

if (!TOKEN) {
  console.error('❌ Defina VITE_FOOTBALL_API no .env');
  process.exit(1);
}

app.get('/api/football/:path*', async (req, res) => {
  try {
    const apiUrl = `https://api.football-data.org/v4/${req.params.path}` + (req.query ? `?${new URLSearchParams(req.query)}` : '');
    console.log('📡 Chamando:', apiUrl);  // Debug
    const response = await fetch(apiUrl, {
      headers: { 'X-Auth-Token': TOKEN }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Erro proxy:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend: http://localhost:${PORT}`);
});
