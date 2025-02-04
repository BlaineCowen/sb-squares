import { useState } from "react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

export default function AdminModal({
  isOpen,
  onClose,
  gridCode,
  onUpdate,
  isProcessing,
}) {
  const [tab, setTab] = useState("squares"); // squares or settings
  const [gridSettings, setGridSettings] = useState({
    name: "",
    squarePrice: 5,
    randomizeQuarters: false,
    payouts: {
      q1: 25,
      q2: 25,
      q3: 25,
      final: 25,
    },
  });

  const handleResetSquares = async () => {
    try {
      if (
        window.confirm(
          "Are you sure you want to reset ALL squares? This cannot be undone."
        )
      ) {
        await axios.post(`/api/admin/reset-squares?gridCode=${gridCode}`);
        onUpdate();
        alert("All squares have been reset");
      }
    } catch (err) {
      console.error("Error resetting squares:", err);
      alert("Failed to reset squares");
    }
  };

  const handleLockGrid = async () => {
    try {
      const response = await fetch(
        `/api/admin/grid/lock?gridCode=${gridCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ randomize: false }),
        }
      );
      onUpdate();
      if (response.ok) {
        alert("Grid locked!");
      }
    } catch (err) {
      console.error("Error locking grid:", err);
      alert("Failed to lock grid");
    }
  };

  const handleRandomizeScores = async () => {
    try {
      const response = await fetch(
        `/api/admin/grid/lock?gridCode=${gridCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ randomize: true }),
        }
      );
      onUpdate();
      if (response.ok) {
        alert("Scores randomized!");
      }
    } catch (err) {
      console.error("Error randomizing scores:", err);
      alert("Failed to randomize scores");
    }
  };

  const handleUnlockGrid = async () => {
    try {
      const response = await fetch(
        `/api/admin/grid/unlock?gridCode=${gridCode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      onUpdate();
      if (response.ok) {
        alert("Grid unlocked and scores cleared!");
      }
    } catch (err) {
      console.error("Error unlocking grid:", err);
      alert("Failed to unlock grid");
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.put(`/api/grids/${gridCode}/settings`, gridSettings);
      alert("Grid settings updated successfully");
      onClose();
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to update grid settings");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Admin Controls</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("squares")}
            className={`px-4 py-2 rounded ${
              tab === "squares" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Square Management
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`px-4 py-2 rounded ${
              tab === "settings" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Grid Settings
          </button>
        </div>

        {tab === "squares" ? (
          <div className="space-y-4">
            <button
              onClick={handleResetSquares}
              disabled={isProcessing}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              {isProcessing ? (
                <LoadingSpinner size={20} />
              ) : (
                "Reset All Squares"
              )}
            </button>
            <button
              onClick={handleLockGrid}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Lock Grid
            </button>
            <button
              onClick={handleRandomizeScores}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Randomize Numbers
            </button>
            <button
              onClick={handleUnlockGrid}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Unlock Grid
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Grid Name
              </label>
              <input
                type="text"
                value={gridSettings.name}
                onChange={(e) =>
                  setGridSettings({ ...gridSettings, name: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Square Price ($)
              </label>
              <input
                type="number"
                value={gridSettings.squarePrice}
                onChange={(e) =>
                  setGridSettings({
                    ...gridSettings,
                    squarePrice: parseInt(e.target.value),
                  })
                }
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Payout Distribution (%)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Q1</label>
                  <input
                    type="number"
                    value={gridSettings.payouts.q1}
                    onChange={(e) =>
                      setGridSettings({
                        ...gridSettings,
                        payouts: {
                          ...gridSettings.payouts,
                          q1: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm">Q2</label>
                  <input
                    type="number"
                    value={gridSettings.payouts.q2}
                    onChange={(e) =>
                      setGridSettings({
                        ...gridSettings,
                        payouts: {
                          ...gridSettings.payouts,
                          q2: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm">Q3</label>
                  <input
                    type="number"
                    value={gridSettings.payouts.q3}
                    onChange={(e) =>
                      setGridSettings({
                        ...gridSettings,
                        payouts: {
                          ...gridSettings.payouts,
                          q3: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm">Final</label>
                  <input
                    type="number"
                    value={gridSettings.payouts.final}
                    onChange={(e) =>
                      setGridSettings({
                        ...gridSettings,
                        payouts: {
                          ...gridSettings.payouts,
                          final: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gridSettings.randomizeQuarters}
                  onChange={(e) =>
                    setGridSettings({
                      ...gridSettings,
                      randomizeQuarters: e.target.checked,
                    })
                  }
                  className="form-checkbox"
                />
                <span className="text-sm font-medium">
                  Randomize Numbers Every Quarter
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                When enabled, numbers will be re-randomized at the start of each
                quarter
              </p>
            </div>
            <button
              onClick={handleUpdateSettings}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
