import { useRouter } from "next/router";

import Grid from "../../components/Grid";
import Header from "../../components/Header";
import ScoreDisplay from "../../components/ScoreDisplay";
import AdminModal from "../../components/AdminModal";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function GridPage() {
  const router = useRouter();
  const { code } = router.query;
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [quarter, setQuarter] = useState(null);
  const [quarterWinners, setQuarterWinners] = useState([]);
  const [squares, setSquares] = useState([]);

  useEffect(() => {
    if (!code || !session) return;

    const checkAdmin = async () => {
      try {
        const response = await fetch(`/api/grids/${code}/check-admin`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to check admin status");
        }
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      }
    };

    const fetchGameData = async () => {
      console.log("Fetching game data...");
      try {
        const response = await fetch("/api/game-data");
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          throw new Error(errorData.error || "Failed to fetch game data");
        }
        console.log("Response OK, parsing JSON...");
        const data = await response.json();
        console.log("Parsed game data:", data);
        setGameData(data);
      } catch (error) {
        console.error("Error fetching game data:", {
          message: error.message,
          stack: error.stack,
          response: error.response,
        });
        // Set default game data on error
        setGameData({
          homeTeam: "Kansas City Chiefs",
          awayTeam: "San Francisco 49ers",
          homeLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
          awayLogo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
          homeQ1: 0,
          homeQ2: 0,
          homeQ3: 0,
          homeQ4: 0,
          awayQ1: 0,
          awayQ2: 0,
          awayQ3: 0,
          awayQ4: 0,
          status: "pre",
          homeScore: 0,
          awayScore: 0,
        });
      }
    };

    checkAdmin();
    fetchGameData();

    // Set up polling for game data
    const interval = setInterval(fetchGameData, 30000);
    return () => clearInterval(interval);
  }, [code, session]);

  useEffect(() => {
    if (!gameData) return;
    if (gameData.status === "post") {
      setQuarter(10);
    } else {
      setQuarter(gameData.quarter);
    }
  }, [gameData]);

  useEffect(() => {
    if (!quarter) return;
    if (!squares.length) return; // Wait for squares data
    if (!gameData) return;

    if (quarter === 1) {
      setQuarterWinners([]);
    }

    if (quarter === 2) {
      // Get last digit of Q1 scores
      const awayNumber = String(gameData.awayQ1 || 0).slice(-1);
      const homeNumber = String(gameData.homeQ1 || 0).slice(-1);

      // find square with winning numbers
      const winningSquare = squares.find(
        (square) =>
          square.awayScore === awayNumber && square.homeScore === homeNumber
      );
      if (winningSquare) {
        setQuarterWinners([winningSquare]);
      }
    }

    if (quarter === 3) {
      // Get last digit of Q2 scores
      const awayNumber = String(gameData.awayQ1 + gameData.awayQ2 || 0).slice(
        -1
      );
      const homeNumber = String(gameData.homeQ1 + gameData.homeQ2 || 0).slice(
        -1
      );

      const winningSquare = squares.find(
        (square) =>
          square.awayScore === awayNumber && square.homeScore === homeNumber
      );
      if (winningSquare) {
        setQuarterWinners((prev) => [...prev, winningSquare]);
      }
    }

    if (quarter === 4) {
      // Get last digit of Q3 scores
      const awayNumber = String(
        gameData.awayQ1 + gameData.awayQ2 + gameData.awayQ3 || 0
      ).slice(-1);
      const homeNumber = String(
        gameData.homeQ1 + gameData.homeQ2 + gameData.homeQ3 || 0
      ).slice(-1);

      const winningSquare = squares.find(
        (square) =>
          square.awayScore === awayNumber && square.homeScore === homeNumber
      );
      if (winningSquare) {
        setQuarterWinners((prev) => [...prev, winningSquare]);
      }
    }

    if (quarter === 10) {
      // Get last digit of final scores
      const awayNumber = String(gameData.awayScore || 0).slice(-1);
      const homeNumber = String(gameData.homeScore || 0).slice(-1);

      const winningSquare = squares.find(
        (square) =>
          square.awayScore === awayNumber && square.homeScore === homeNumber
      );
      if (winningSquare) {
        setQuarterWinners((prev) => [...prev, winningSquare]);
      }
    }
  }, [quarter]); // Only run when quarter changes

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 pt-4">
        <ScoreDisplay gameData={gameData} />
      </div>
      <div id="grid-container" className="container">
        {/* Home Team Logo (left) */}
        {gameData && (
          <div id="home-logo">
            <img
              src={gameData.homeLogo}
              alt={gameData.homeTeam}
              className="w-16 h-16 object-contain"
            />
          </div>
        )}

        {/* Away Team Logo (top) */}
        {gameData && (
          <div id="away-logo">
            <img
              src={gameData.awayLogo}
              alt={gameData.awayTeam}
              className="w-16 h-16 object-contain"
            />
          </div>
        )}

        <Grid
          gridCode={code}
          isAdmin={isAdmin}
          gameData={gameData}
          onSquaresUpdate={setSquares}
        />
        <div id="spacer"></div>
      </div>

      {quarterWinners.length > 0 && (
        <div id="quarter-winners">
          <h2 className="text-center text-xl font-bold text-white mb-4">
            Quarter Winners
          </h2>
          {quarterWinners.map((winner, index) => (
            <div key={winner.id} className="text-center text-white mb-2">
              {`Q${index + 1}: ${winner.owner?.name || "Unclaimed"}`}
            </div>
          ))}
        </div>
      )}

      <h3 className="text-center mt-4 !text-white">
        Scores will be randomized by admin at game time
      </h3>

      {isAdmin && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAdminModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Admin Actions
          </button>
        </div>
      )}

      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        gridCode={code}
        onUpdate={() => {
          // Refresh the grid component
          window.location.reload();
        }}
      />
    </div>
  );
}

GridPage.requiresAuth = true;
