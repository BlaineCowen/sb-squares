import { useRouter } from "next/router";

import Grid from "../../components/Grid";
import Header from "../../components/Header";
import ScoreDisplay from "../../components/ScoreDisplay";
import AdminModal from "../../components/AdminModal";
import ShareIcon from "../../components/ShareIcon";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function GridPage() {
  const router = useRouter();
  const { code } = router.query;
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);
  const [quarter, setQuarter] = useState(null);
  const [quarterWinners, setQuarterWinners] = useState([]);
  const [squares, setSquares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [gridData, setGridData] = useState(null);
  const [primaryColor, setPrimaryColor] = useState(null);
  const [homePrimaryColor, setHomePrimaryColor] = useState(null);

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
      setIsLoading(false);
    };

    // const fetchSquares = async () => {
    //   if (!gridData) return;

    //   try {
    //     const response = await fetch(`/api/squares?gridCode=${code}`);
    //     if (!response.ok) {
    //       throw new Error("Failed to fetch squares");
    //     }
    //     const data = await response.json();

    //     if (gridData?.isSortedByScores) {
    //       // Sort squares by away score (0-9) then home score (0-9)
    //       const sortedSquares = [...data].sort((a, b) => {
    //         const aAway = parseInt(a.awayScore || "0");
    //         const bAway = parseInt(b.awayScore || "0");
    //         const aHome = parseInt(a.homeScore || "0");
    //         const bHome = parseInt(b.homeScore || "0");

    //         if (aAway !== bAway) {
    //           return aAway - bAway;
    //         }
    //         return aHome - bHome;
    //       });
    //       setSquares(sortedSquares);
    //     } else {
    //       setSquares(data);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching squares:", error);
    //     setSquares([]);
    //   }
    // };

    const getPrimaryColor = (logoUrl) => {
      const img = new Image();
      img.src = logoUrl;
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return `#${data[0].toString(16).padStart(2, "0")}${data[1]
        .toString(16)
        .padStart(2, "0")}${data[2].toString(16).padStart(2, "0")}`;
    };

    const fetchGridData = async () => {
      try {
        const gridDataResponse = await fetch(`/api/grids/${code}/data`);
        const gridData = await gridDataResponse.json();
        setGridData(gridData);
        // await fetchSquares();
        checkAdmin();
        await fetchGameData();
      } catch (error) {
        console.error(error);
      }
    };

    if (code) {
      fetchGridData();
    }

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

  const handleSquareSelect = async (x, y) => {
    if (isSelecting) return;
    setIsSelecting(true);
    try {
      const response = await fetch("/api/squares/select", {
        method: "POST",
        body: JSON.stringify({ x, y, gridCode: code }),
        headers: { "Content-Type": "application/json" },
      });
      // ... existing logic
    } finally {
      setIsSelecting(false);
    }
  };

  const handleAdminAction = async (action) => {
    setIsAdminActionLoading(true);
    try {
      // ... existing admin action logic
    } finally {
      setIsAdminActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <Header />
      {gridData?.name && (
        <h1 className="text-center mt-4 ">{gridData?.name}</h1>
      )}
      <div className="container mx-auto px-4 pt-4">
        <ScoreDisplay gameData={gameData} />
      </div>
      <h3 className="text-center mt-4 ">
        Scores will be randomized by admin at game time
      </h3>
      <h2 className="text-center mt-4">Click on a square to claim</h2>
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
          isSortedByScores={gridData?.isSortedByScores}
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

      <div className="text-center mt-4">
        <button
          onClick={() => {
            // share
            const shareUrl = `${window.location.origin}/grid/${code}`;
            navigator.clipboard.writeText(shareUrl);
            alert("Grid URL copied to clipboard");
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <div className="flex items-center ">
            <span className="mr-1">Share Grid</span>
            <ShareIcon className=" w-4 h-4" />
          </div>
        </button>
      </div>

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
        isLocked={gridData?.isLocked}
        isProcessing={isAdminActionLoading}
        gridCode={code}
        isSortedByScores={gridData?.isSortedByScores}
        onUpdate={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

GridPage.requiresAuth = true;
