import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import MainLayout from "@/components/MainLayout";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

export default function CreateGrid() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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

  const createGrid = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/grids/create-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gridSettings),
      });
      if (!response.ok) throw new Error("Failed to create grid");
      const data = await response.json();
      router.push(`/grid/${data.gridCode}`);
    } catch (error) {
      console.error("Error creating grid:", error);
      alert("Failed to create grid");
    }
  };

  // Show loading state or return null while checking authentication
  if (status === "loading") {
    return <MainLayout>Loading...</MainLayout>;
  }

  // Don't render the form if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="home-page min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-800 animate-gradient-x overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-xl relative rounded-t-sm rounded-b-lg">
            <div className="p-10">
              <h1 className="text-4xl font-bold text-center mb-2">
                Create a New Grid
              </h1>
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Grid Name</label>
                <Input
                  placeholder="Enter grid name"
                  value={gridSettings.name}
                  onChange={(e) =>
                    setGridSettings({ ...gridSettings, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Square Price ($)</label>
                <Input
                  placeholder="Enter price per square"
                  type="number"
                  value={gridSettings.squarePrice}
                  onChange={(e) =>
                    setGridSettings({
                      ...gridSettings,
                      squarePrice: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quarter Payouts (%)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Set the percentage of the total pot paid out for each quarter
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Q1 Payout</label>
                    <Input
                      placeholder="Q1 %"
                      type="number"
                      value={gridSettings.payouts.q1}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          payouts: {
                            ...gridSettings.payouts,
                            q1: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Q2 Payout</label>
                    <Input
                      placeholder="Q2 %"
                      type="number"
                      value={gridSettings.payouts.q2}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          payouts: {
                            ...gridSettings.payouts,
                            q2: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Q3 Payout</label>
                    <Input
                      placeholder="Q3 %"
                      type="number"
                      value={gridSettings.payouts.q3}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          payouts: {
                            ...gridSettings.payouts,
                            q3: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final Payout</label>
                    <Input
                      placeholder="Final %"
                      type="number"
                      value={gridSettings.payouts.final}
                      onChange={(e) =>
                        setGridSettings({
                          ...gridSettings,
                          payouts: {
                            ...gridSettings.payouts,
                            final: parseFloat(e.target.value),
                          },
                        })
                      }
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
                    Randomize Quarters
                  </label>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  When enabled, the numbers for each quarter will be randomly
                  shuffled, creating different winning combinations for each
                  quarter.
                </p>
              </div>

              <Button
                onClick={createGrid}
                className="w-full py-3 text-lg font-semibold bg-emerald-900 text-white rounded-lg hover:bg-green-600"
              >
                Create Grid
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
