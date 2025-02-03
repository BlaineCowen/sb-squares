import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function GridSetup() {
  const router = useRouter();
  const { code } = router.query;
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    name: "",
    squarePrice: 5,
    payouts: {
      q1: 25,
      q2: 25,
      q3: 25,
      final: 25,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/grids/${code}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to update grid settings");

      // Redirect to the grid page
      router.push(`/grid/${code}`);
    } catch (error) {
      console.error("Settings update error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">Grid Settings</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grid Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Square ($)
              </label>
              <input
                type="number"
                min="1"
                value={settings.squarePrice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    squarePrice: parseInt(e.target.value),
                  })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Randomize Quarters
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.randomizeQuarters}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      randomizeQuarters: !settings.randomizeQuarters,
                    })
                  }
                />
                <p className=" ml-2 text-xs text-gray-500 mt-1">
                  When enabled, numbers will be re-randomized at the start of
                  each quarter
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Payout Percentages</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Q1 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payouts.q1}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payouts: {
                          ...settings.payouts,
                          q1: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Q2 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payouts.q2}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payouts: {
                          ...settings.payouts,
                          q2: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Q3 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payouts.q3}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payouts: {
                          ...settings.payouts,
                          q3: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">
                    Final (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payouts.final}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payouts: {
                          ...settings.payouts,
                          final: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
