import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-xl relative rounded-t-sm rounded-b-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          Pending Approvals
        </h1>
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <div className="mt-6 space-y-4">
          {pendingSquares.map((square) => (
            <div
              key={square.id}
              className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-gray-200"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  Square ({square.x},{square.y})
                </p>
                <p className="text-sm text-gray-500">
                  ${square.price} by {square.owner.name}
                </p>
              </div>
              <Button
                onClick={() => handleApprove(square.id)}
                className="bg-emerald-900 hover:bg-green-600"
              >
                Approve
              </Button>
            </div>
          ))}
          {pendingSquares.length === 0 && (
            <p className="text-center text-gray-500">No pending approvals</p>
          )}
        </div>
      </div>
    </div>
  );
}
