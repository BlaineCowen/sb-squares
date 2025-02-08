import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { XSquare } from "lucide-react";

export default function AdminModal({
  isOpen,
  onClose,
  isLocked,
  gridData,
  onUpdate,
  isProcessing,
  isSortedByScores,
}) {
  const [tab, setTab] = useState("squares");
  const [gridSettings, setGridSettings] = useState({
    name: "",
    squarePrice: 5,
    randomizeQuarters: false,
    payouts: { q1: 25, q2: 25, q3: 25, final: 25 },
  });

  useEffect(() => {
    if (gridData) {
      setGridSettings({
        name: gridData.name || "",
        squarePrice: gridData.squarePrice || 5,
        randomizeQuarters: gridData.randomizeQuarters || false,
        payouts: {
          q1: gridData.payouts?.q1 || 25,
          q2: gridData.payouts?.q2 || 25,
          q3: gridData.payouts?.q3 || 25,
          final: gridData.payouts?.final || 25,
        },
      });
    }
  }, [gridData]);

  const handleResetSquares = async () => {
    try {
      if (
        window.confirm(
          "Are you sure you want to reset ALL squares? This cannot be undone."
        )
      ) {
        const response = await fetch(
          `/api/admin/reset-squares?gridCode=${gridData.code}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to reset squares");
        }

        onUpdate();
      }
    } catch (err) {
      console.error("Error resetting squares:", err);
      alert("Failed to reset squares");
    }
  };

  const handleLockGrid = async () => {
    try {
      if (
        !window.confirm(
          "Are you sure you want to lock the grid? This will randomize the numbers and cannot be undone unless you reset the grid."
        )
      ) {
        return;
      }

      const response = await fetch(
        `/api/admin/grid/lock?gridCode=${gridData.code}`,
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
        onClose();
      }
    } catch (err) {
      console.error("Error locking grid:", err);
      alert("Failed to lock grid");
    }

    // randomize numbers
    await axios.post(`/api/admin/grid/randomize?gridCode=${gridData.code}`);
    onUpdate();
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.put(`/api/grids/${gridData.code}/settings`, gridSettings);
      alert("Grid settings updated successfully");
      onClose();
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to update grid settings");
    }
  };

  const handleSortChange = async () => {
    try {
      const response = await fetch(`/api/grids/${gridData.code}/toggle-sort`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sortState: !isSortedByScores }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sort state");
      }

      onUpdate();
    } catch (error) {
      console.error("Error updating sort state:", error);
      alert("Failed to update sort state");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <AnimatePresence
        mode="wait"
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <div className="bg-white/90 text-black backdrop-blur-sm shadow-xl relative rounded-t-sm rounded-b-lg transition-all duration-300 ease-in-out animate-slide-in">
          <div className="p-6">
            {/* add a close button using shadcn */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 hover:bg-gray-200 rounded-full p-2"
            >
              <XSquare className="w-8 h-8" />
            </button>
            <h1 className="text-2xl !text-black font-bold text-center mb-2">
              Admin Controls
            </h1>
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            <div className="mt-6 space-y-6">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setTab("squares")}
                  variant={tab === "squares" ? "outline" : "default"}
                  className="w-full hover:border-black hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  Square Management
                </Button>
                <Button
                  onClick={() => setTab("settings")}
                  variant={tab === "settings" ? "outline" : "default"}
                  className="w-full hover:border-black hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  Grid Settings
                </Button>
              </div>

              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {tab === "squares" ? (
                  <div className="space-y-4">
                    {!isLocked && (
                      <Button
                        onClick={handleLockGrid}
                        className="w-full bg-emerald-900 text-sky-50 hover:bg-green-600"
                      >
                        Lock Grid & Randomize Numbers
                      </Button>
                    )}
                    {isLocked && !isSortedByScores && (
                      <Button
                        onClick={handleSortChange}
                        className="w-full bg-emerald-900 hover:bg-green-600"
                      >
                        Sort by Scores
                      </Button>
                    )}
                    {isSortedByScores && (
                      <Button
                        onClick={handleSortChange}
                        className="w-full bg-emerald-900 hover:bg-green-600"
                      >
                        Unsort by Scores
                      </Button>
                    )}
                    <Button
                      onClick={handleResetSquares}
                      variant="destructive"
                      className="w-full"
                    >
                      Reset All Squares
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Grid Name</label>
                      <Input
                        value={gridSettings.name}
                        onChange={(e) =>
                          setGridSettings({
                            ...gridSettings,
                            name: e.target.value,
                          })
                        }
                        placeholder={gridSettings.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Square Price ($)
                      </label>
                      <Input
                        type="number"
                        value={gridSettings.squarePrice}
                        onChange={(e) =>
                          setGridSettings({
                            ...gridSettings,
                            squarePrice: parseInt(e.target.value),
                          })
                        }
                        placeholder="Enter price per square"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Quarter Payouts (%)
                      </label>
                      <p className="text-sm text-gray-500 mb-2">
                        Set the percentage of the total pot paid out for each
                        quarter
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Q1 Payout
                          </label>
                          <Input
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
                            placeholder="Q1 %"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Q2 Payout
                          </label>
                          <Input
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
                            placeholder="Q2 %"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Q3 Payout
                          </label>
                          <Input
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
                            placeholder="Q3 %"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Final Payout
                          </label>
                          <Input
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
                            placeholder="Final %"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="checkbox"
                          id="randomize-quarters"
                          checked={gridSettings.randomizeQuarters}
                          onChange={(e) =>
                            setGridSettings({
                              ...gridSettings,
                              randomizeQuarters: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-gray-300 accent-black"
                        />
                        <label
                          htmlFor="randomize-quarters"
                          className="text-sm font-medium"
                        >
                          Randomize Numbers Every Quarter
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 ml-6">
                        When enabled, numbers will be re-randomized at the start
                        of each quarter
                      </p>
                    </div>

                    <Button
                      onClick={handleUpdateSettings}
                      className="w-full text-sky-50 bg-emerald-900 hover:bg-green-600"
                    >
                      Save Settings
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
}
