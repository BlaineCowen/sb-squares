const fetch = require("node-fetch");

async function initGameData() {
  try {
    const response = await fetch("http://localhost:3000/api/cron/update-game", {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to init game data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Game data initialized:", data);
  } catch (error) {
    console.error("Init failed:", error);
  }
}

initGameData();
