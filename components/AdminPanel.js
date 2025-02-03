import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [pendingSquares, setPendingSquares] = useState([]);

  useEffect(() => {
    fetch("/api/squares?status=PENDING")
      .then((res) => res.json())
      .then((data) => setPendingSquares(data));
  }, []);

  const handleApprove = async (squareId) => {
    try {
      await fetch(`/api/squares/${squareId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      setPendingSquares(pendingSquares.filter((sq) => sq.id !== squareId));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
      <div className="space-y-2">
        {pendingSquares.map((square) => (
          <div
            key={square.id}
            className="flex items-center justify-between p-2 border"
          >
            <span>
              {square.x},{square.y} - ${square.price} by {square.owner.name}
            </span>
            <button
              onClick={() => handleApprove(square.id)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
