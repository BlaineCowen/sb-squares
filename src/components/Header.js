import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ColorPickerModal from "../components/ColorPickerModal";
import { Button } from "../components/ui/button";

export default function Header({ code, onColorChange }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (session?.user?.color) {
      setSelectedColor(session.user.color);
    }
  }, [session]);

  const handleSignOut = async () => {
    await router.push("/login");
    await signOut();
  };

  const updateUserColor = async (color) => {
    try {
      const response = await fetch("/api/user/color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      if (!response.ok) throw new Error("Failed to update color");

      // Update local state
      setSelectedColor(color);

      // Notify parent components of color change
      if (onColorChange) {
        onColorChange(color);
      }
    } catch (error) {
      console.error("Error updating color:", error);
      alert("Failed to update color");
    }
  };

  return (
    <header className="bg-white/90 relative dark:bg-gray-900/90 shadow-xl p-4 flex justify-between items-center animate-fade-in backdrop-blur-lg z-50">
      <Button
        onClick={() => router.push("/")}
        className="bg-gray-200 h-full dark:bg-white/10 backdrop-blur-sm text-gray-800 dark:text-gray-200 px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 font-semibold hover:scale-105 text-sm md:text-base"
      >
        Home
      </Button>

      <div className="flex items-center gap-3 md:gap-6">
        {session ? (
          <>
            <span className="hidden md:inline text-center mx-2 md:mx-4 text-gray-800 dark:text-gray-200 font-medium text-sm md:text-base">
              Welcome, {session.user.name}!
            </span>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 md:w-auto md:h-auto px-2 py-2 md:px-4 md:py-2 rounded-full border-2 border-white/20 hover:border-white/40 transition-colors duration-300 relative overflow-hidden group"
              style={{
                backgroundImage: `linear-gradient(to bottom right, 
                  ${selectedColor || session?.user?.color || "#22c55e"}ff, 
                  ${selectedColor || session?.user?.color || "#22c55e"}aa)`,
              }}
            >
              <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors duration-300" />
              <span className="hidden md:inline relative z-10 text-white font-medium text-sm md:text-base">
                Pick Color
              </span>
            </button>
            <button
              onClick={handleSignOut}
              className="bg-gray-200 dark:bg-white/10 backdrop-blur-sm text-gray-800 dark:text-gray-200 px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 font-semibold hover:scale-105 text-sm md:text-base"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-blue-500 text-white dark:text-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded text-sm md:text-base"
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
