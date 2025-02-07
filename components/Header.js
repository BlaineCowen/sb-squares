import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import ColorPickerModal from "./ColorPickerModal";

export default function Header({ code }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [userGrids, setUserGrids] = useState([]);
  const [selectedGrid, setSelectedGrid] = useState(code || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (session?.user?.color) {
      setSelectedColor(session.user.color);
    }
  }, [session]);

  const updateUserColor = async (color) => {
    try {
      const response = await fetch("/api/user/color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      if (!response.ok) throw new Error("Failed to update color");
      const data = await response.json();
      setSelectedColor(color);
      await update({
        ...session,
        user: { ...session.user, color: data.user.color },
      });
    } catch (error) {
      console.error("Error updating color:", error);
      alert("Failed to update color");
    }
  };

  return (
    <header className="bg-white/75 dark:bg-gray-900/75 shadow-xl p-4 flex justify-between items-center animate-fade-in">
      <button
        onClick={() => router.push("/")}
        className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold hover:scale-105"
      >
        Home
      </button>

      <div className="flex items-center gap-6">
        {session ? (
          <>
            <span className="text-center mx-4 text-gray-800 dark:text-gray-200 font-medium">
              Welcome, {session.user.name}!
            </span>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-4 py-2 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors duration-300 relative overflow-hidden group"
              style={{
                backgroundImage: `linear-gradient(to bottom right, 
                  ${selectedColor || session?.user?.color || "#22c55e"}ff, 
                  ${selectedColor || session?.user?.color || "#22c55e"}aa)`,
              }}
            >
              <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
              <span className="relative z-10 text-white font-medium">
                Pick Color
              </span>
            </button>
            <button
              onClick={signOut}
              className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-300 font-semibold shadow-lg hover:shadow-red-500/30"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-blue-500 text-white dark:text-gray-100 px-4 py-2 rounded"
          >
            Sign In
          </button>
        )}
      </div>
      <ColorPickerModal
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onConfirm={async (color) => {
          await updateUserColor(color);
          setShowColorPicker(false);
        }}
        initialColor={selectedColor || session?.user?.color || "#22c55e"}
      />
    </header>
  );
}
