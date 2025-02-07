import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { loadStripe } from "stripe";
import SelectionModal from "./SelectionModal";
import AdminModal from "./AdminModal";
import ColorPickerModal from "./ColorPickerModal";
import LoadingSpinner from "./LoadingSpinner";

export default function Grid({
  gridCode,
  isAdmin,
  gameData,
  onSquaresUpdate,
  isSortedByScores,
}) {
  const { data: session } = useSession();
  const [squares, setSquares] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminActionModal, setAdminActionModal] = useState(false);
  const [pendingSquare, setPendingSquare] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [gridData, setGridData] = useState({
    isLocked: false,
    xScoreArr: "?",
    yScoreArr: "?",
  });
  const [columnNumbers, setColumnNumbers] = useState(
    [...Array(10)].map((_, i) => i)
  );
  const [rowNumbers, setRowNumbers] = useState([...Array(10)].map((_, i) => i));
  const [isSelecting, setIsSelecting] = useState(false);
  const [rowHeight, setRowHeight] = useState("6rem"); // Default desktop height
  const userColor = session?.user?.color || "#22c55e";

  useEffect(() => {
    fetchGridData();
    fetchSquares();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchGridData();
      fetchSquares();
    }, 10000); // 10 seconds

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [gridCode]);

  // Set row height based on screen size
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerWidth <= 768 ? "4.5rem" : "6rem";
      setRowHeight(newHeight);
      document.documentElement.style.setProperty("--row-height", newHeight);
    };

    handleResize(); // Initial set
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchGridData = async () => {
    try {
      const { data } = await axios.get(`/api/grids/${gridCode}`);
      setGridData({
        isLocked: data.isLocked,
        xScoreArr: data.xScoreArr === "?" ? "?" : JSON.parse(data.xScoreArr),
        yScoreArr: data.yScoreArr === "?" ? "?" : JSON.parse(data.yScoreArr),
      });

      if (data.isLocked && !gridData.isSortedByScores) {
        setColumnNumbers(
          data.xScoreArr === "?" ? columnNumbers : JSON.parse(data.xScoreArr)
        );
        setRowNumbers(
          data.yScoreArr === "?" ? rowNumbers : JSON.parse(data.yScoreArr)
        );
      }
    } catch (error) {
      console.error("Error fetching grid data:", error);
    }
  };

  const fetchSquares = async () => {
    try {
      const { data } = await axios.get(`/api/squares?gridCode=${gridCode}`);
      let squaresToSet = data;

      if (isSortedByScores) {
        // Sort squares by away score (0-9) then home score (0-9)
        squaresToSet = [...data].sort((a, b) => {
          const aAway = parseInt(a.awayScore || "0");
          const bAway = parseInt(b.awayScore || "0");
          const aHome = parseInt(a.homeScore || "0");
          const bHome = parseInt(b.homeScore || "0");

          if (aAway !== bAway) {
            return aAway - bAway;
          }
          return aHome - bHome;
        });
      }

      setSquares(squaresToSet);

      // Call the callback with updated squares
      if (onSquaresUpdate) {
        onSquaresUpdate(squaresToSet);
      }
    } catch (error) {
      console.error("Error fetching squares:", error);
      alert(error.response?.data?.error || "Failed to load grid");
      setSquares(
        Array(100)
          .fill()
          .map((_, i) => ({
            // Fallback demo data
            id: i,
            x: i % 10,
            y: Math.floor(i / 10),
            status: "AVAILABLE",
          }))
      );
    }
  };

  const handleSquareClick = (x, y) => {
    if (gridData.isLocked && !isAdmin) {
      alert("This grid is locked! No more changes allowed.");
      return;
    }
    const square = squares.find((s) => s.x === x && s.y === y);

    if (isAdmin && square?.status === "PENDING") {
      setPendingSquare(square);
      setAdminActionModal(true);
    } else if (!square || square.status === "AVAILABLE") {
      setSelectedSquare({ x, y });
      setShowModal(true);
    }
  };

  const handleAdminApprove = async () => {
    try {
      const response = await fetch(`/api/squares/${pendingSquare.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          color: pendingSquare.owner.color,
        }),
      });

      if (!response.ok) throw new Error("Approval failed");

      const updated = await response.json();
      setSquares(
        squares.map((sq) =>
          sq.id === pendingSquare.id ? { ...sq, ...updated } : sq
        )
      );
      setAdminActionModal(false);
    } catch (error) {
      console.error("Approval error:", error);
      alert(error.message);
    }
  };

  const handleAdminReject = async () => {
    try {
      const response = await fetch(`/api/squares/${pendingSquare.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!response.ok) throw new Error("Rejection failed");

      const updated = await response.json();
      setSquares(
        squares.map((sq) =>
          sq.id === pendingSquare.id ? { ...sq, ...updated } : sq
        )
      );
      setAdminActionModal(false);
    } catch (error) {
      console.error("Rejection error:", error);
      alert(error.message);
    }
  };

  const handleConfirm = async (price) => {
    if (!session) return alert("Please login first");

    try {
      const response = await axios.post(`/api/squares?gridCode=${gridCode}`, {
        x: selectedSquare.x,
        y: selectedSquare.y,
        price,
      });

      if (!response.status) throw new Error("Failed to claim square");

      fetchSquares();
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.error || "Error selecting square");
    }
  };

  const handleSquareSelect = async (x, y) => {
    if (isSelecting) return;
    setIsSelecting(true);

    try {
      handleSquareClick(x, y);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <>
      <div
        id="grid-content"
        className="grid-scroll-container bg-white/5 rounded-2xl shadow-2xl"
        style={{ "--row-height": rowHeight }}
      >
        <div className="grid-inner-content grid grid-areas-layout">
          {gridData && (
            <>
              {/* Column labels (top) */}
              <div className="grid-area-top grid grid-cols-10">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`text-center text-sm bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-center ${
                      i === 9 ? "border-r" : ""
                    }`}
                    style={{
                      height: "calc(var(--row-height) * 0.4)",
                      minHeight: "calc(var(--row-height) * 0.4)",
                    }}
                  >
                    {gridData.isLocked && !isSortedByScores
                      ? columnNumbers[i]
                      : isSortedByScores
                      ? i
                      : "?"}
                  </div>
                ))}
              </div>

              {/* Row labels (left) */}
              <div className="grid-area-left flex flex-col sticky left-0">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 dark:text-gray-200 w-8 border-r-2 border-gray-200 dark:border-gray-700 font-semibold`}
                    style={{ height: "var(--row-height)" }}
                  >
                    {gridData.isLocked && !isSortedByScores
                      ? rowNumbers[i]
                      : isSortedByScores
                      ? i
                      : "?"}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="grid-area-main grid grid-cols-10">
            {squares.map((square) => {
              const statusStyle = {
                AVAILABLE: "bg-white hover:bg-gray-50",
                PENDING: "bg-gradient-to-br",
                APPROVED: "bg-gradient-to-br",
              }[square.status];

              const gradient =
                square.status !== "AVAILABLE"
                  ? {
                      backgroundImage: `linear-gradient(to bottom right, 
                  ${userColor}ff, 
                  ${userColor}aa)`,
                    }
                  : {};

              return (
                <div
                  key={square.id}
                  className={`square border-2 border-gray-200/50 cursor-pointer 
                    transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-lg 
                    ${statusStyle}`}
                  style={{
                    height: "var(--row-height)",
                    ...gradient,
                  }}
                  onClick={() => handleSquareSelect(square.x, square.y)}
                  disabled={!square.status || isSelecting}
                >
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <span className="text-sm font-medium text-center w-full truncate px-1">
                      {square?.owner?.name ||
                        (square.status === "APPROVED" && "✅")}
                    </span>
                    <div className="flex justify-between w-full px-2 mt-1 text-xs">
                      {square.awayScore && (
                        <span className="text-gray-600">
                          A:{square.awayScore}
                        </span>
                      )}
                      {square.homeScore && (
                        <span className="text-gray-600">
                          H:{square.homeScore}
                        </span>
                      )}
                    </div>
                    {square.status === "PENDING" && (
                      <span className="text-xs">pending</span>
                    )}
                  </div>
                  {isSelecting && square === selectedSquare && (
                    <LoadingSpinner size={20} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
      />

      {adminActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-black max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Admin Approval</h2>
            <p className="mb-4">
              Approve {pendingSquare.owner?.name}'s claim on position (
              {pendingSquare.x}, {pendingSquare.y}) for ${pendingSquare.price}?
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAdminActionModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminApprove}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={handleAdminReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <ColorPickerModal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onConfirm={(color) => {
          setPendingSquare((prev) => ({
            ...prev,
            owner: { ...prev.owner, color },
          }));
        }}
        initialColor={pendingSquare?.owner?.color || "#22c55e"}
      />
    </>
  );
}
