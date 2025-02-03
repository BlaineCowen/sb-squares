import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [userGrids, setUserGrids] = useState([]);

  useEffect(() => {
    if (session) {
      fetchUserGrids();
    }
  }, [session]);

  const fetchUserGrids = async () => {
    try {
      const response = await fetch("/api/grids/user");
      if (!response.ok) throw new Error("Failed to fetch grids");
      const data = await response.json();
      setUserGrids(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching grids:", error);
      setUserGrids([]); // Set empty array if error
    }
  };

  const handleCreateGrid = async () => {
    try {
      const response = await fetch("/api/grids", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create grid");
      }

      router.push(`/grid/${data.code}/setup`);
    } catch (error) {
      console.error("Grid creation error:", error);
      alert(`Creation failed: ${error.message}`);
    }
  };

  const handleJoinGrid = (e) => {
    e.preventDefault();
    router.push(`/grid/${joinCode}`);
  };

  const handleGridCreated = (code, isAdmin) => {
    setCode(code);
    setIsAdmin(isAdmin);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full space-y-6">
          <h1 className="text-3xl text-black font-bold text-center">
            Super Bowl Squares
          </h1>

          {session ? (
            <>
              {userGrids.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Grids
                  </label>
                  <select
                    onChange={(e) => router.push(`/grid/${e.target.value}`)}
                    className="w-full border p-2 rounded text-black"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a Grid
                    </option>
                    {userGrids.map((grid) => (
                      <option key={grid.code} value={grid.code}>
                        {grid.name || `Grid ${grid.code}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleCreateGrid}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Create New Grid
              </button>

              <form onSubmit={handleJoinGrid} className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter Grid Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full border p-2 rounded"
                  maxLength="6"
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  Join Existing Grid
                </button>
              </form>

              <button
                onClick={() => signOut()}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
