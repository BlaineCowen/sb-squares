export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // During Super Bowl, update this with the correct date
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=1000&dates=2025"
    );

    if (!response.ok) throw new Error("Failed to fetch from ESPN");

    const data = await response.json();
    const lastEvent = data.events[data.events.length - 1];
    return res.json(lastEvent);
  } catch (error) {
    console.error("Score fetch error:", error);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
}
