import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Grid as GridReact,
  PlusCircle,
  UserPlus,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [userGrids, setUserGrids] = useState([]);
  const [gridCode, setGridCode] = useState("");
  const [gridExists, setGridExists] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
      router.push("/login");
      setUserGrids([]);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const handleJoinGrid = async () => {
    // check if grid exists first
    const response = await fetch(`/api/grids/${gridCode.trim()}`);
    if (!response.ok) {
      setGridExists(false);
      return;
    }
    router.push(`/grid/${gridCode.trim()}`);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div>
      <Header />
      <div className="home-page min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-800 animate-gradient-x overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-xl relative rounded-t-sm rounded-b-lg ">
            <div className="p-10">
              <h1 className="text-4xl font-bold text-center mb-2">
                Super Bowl Squares
              </h1>
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            <div className="p-6 space-y-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <button className="w-full py-6 text-lg font-semibold bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                      <GridReact className="mr-2 h-5 w-5" />
                      {selectedGrid || "Select Grid"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-white text-black border border-gray-200 rounded-lg">
                  {userGrids.length > 0 ? (
                    userGrids.map((grid) => (
                      <DropdownMenuItem
                        key={grid.code}
                        className="hover:bg-gray-100"
                        onSelect={() => router.push(`/grid/${grid.code}`)}
                      >
                        {grid.name || `Grid ${grid.code}`}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No grids available
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <button
                  onClick={() => router.push("/create-grid")}
                  className="w-full py-6 text-lg font-semibold bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create New Grid
                </button>
              </motion.div>
              <div className="mt-4 flex items-center">
                <input
                  className="w-full p-2 mr-2 rounded-lg border border-black"
                  placeholder="Enter grid code"
                  value={gridCode}
                  onChange={(e) => setGridCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoinGrid();
                    }
                  }}
                />
                <button
                  className="bg-black text-white p-2 hover:bg-gray-800 whitespace-nowrap rounded-lg"
                  onClick={handleJoinGrid}
                >
                  Join
                </button>
              </div>
              {!gridExists && (
                <p className="text-red-500 text-sm mt-2">
                  Grid not found. Please check your code and try again.
                </p>
              )}
            </div>
          </div>
        </motion.div>
        <Particles />
      </div>
    </div>
  );
}

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: Math.random() * 5 + 1,
            height: Math.random() * 5 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
      ))}
    </div>
  );
}
