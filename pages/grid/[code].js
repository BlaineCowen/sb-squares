import { useRouter } from "next/router";

import Grid from "../../src/components/Grid";
import Header from "../../src/components/Header";
import ScoreDisplay from "../../src/components/ScoreDisplay";
import AdminModal from "../../src/components/AdminModal";
import ShareIcon from "../../src/components/ShareIcon";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import LoadingSpinner from "../../src/components/LoadingSpinner";

export default function GridPage() {
  const router = useRouter();
  const { code } = router.query;
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);

  const [quarterWinners, setQuarterWinners] = useState(() => []);
  const [squares, setSquares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [gridData, setGridData] = useState(null);
  const [primaryColor, setPrimaryColor] = useState(null);
  const [homePrimaryColor, setHomePrimaryColor] = useState(null);
  const prevQuarter = useRef(null);
  const [userColor, setUserColor] = useState(null);

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
      try {
        const response = await fetch("/api/game-data");
        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          throw new Error(errorData.error || "Failed to fetch game data");
        }

        const data = await response.json();

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

    // get quarter winners
    const fetchQuarterWinners = async () => {
      const response = await fetch(`/api/grids/${code}/winners`);
      const data = await response.json();
      setQuarterWinners(data);
    };
    fetchQuarterWinners();
  }, [gameData]);

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
        <h1 className="text-center mt-4 ">{gridData?.name} </h1>
      )}

      <div className="container mx-auto px-4 pt-4">
        <ScoreDisplay gameData={gameData} />
      </div>
      {gridData?.isLocked && (
        <h3 className="text-center mt-4 ">Grid is locked</h3>
      )}
      {!gridData?.isLocked && (
        <h3 className="text-center mt-4 ">
          Scores will be randomized by admin at game time
        </h3>
      )}
      {gridData?.isLocked && gridData.randomizeQuarters && (
        <h2 className="text-center mt-4">
          Scores will be randomized every quarter
        </h2>
      )}
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

      <div className="container mx-auto px-4 pt-4">
        <h2 className="text-center mt-4">Quarter Winners</h2>
      </div>
      {quarterWinners.length > 0 && (
        <div className="container flex justify-center mx-auto px-4 pt-4">
          {quarterWinners.map((winner) => (
            <div
              key={winner.quarter}
              className="relative w-24 h-24 border border-gray-300 flex flex-col items-center justify-center text-sm"
              style={{
                backgroundColor: winner.winner.color || "#fff",
                color: winner.winner.color ? "#fff" : "#000",
              }}
            >
              <div className="absolute top-1 left-1 text-xs">
                Q{winner.quarter}
              </div>
              <div className="font-bold">{winner.winner.name}</div>
              <div className="flex gap-2">
                <span>{winner.awayScore}</span>
                <span>-</span>
                <span>{winner.homeScore}</span>
              </div>
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
        gridData={gridData}
        isSortedByScores={gridData?.isSortedByScores}
        onUpdate={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

GridPage.requiresAuth = true;
