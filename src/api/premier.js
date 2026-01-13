export default async function handler(req, res) {
  const response = await fetch("https://api.cors.lol/?url=https://api.football-data.org/v4/competitions/PL", {
    headers: {
      "X-Auth-Token": process.env.FOOTBALL_API
    }
  });

  const data = await response.json();
  return res.status(200).json(data);
}
