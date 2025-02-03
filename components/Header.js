import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import ColorPickerModal from "./ColorPickerModal";

export default function Header({ code }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [userGrids, setUserGrids] = useState([]);
  const [selectedGrid, setSelectedGrid] = useState(code || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    session?.user?.color || "#000000"
  );

  const updateUserColor = async (color) => {
    try {
      const response = await fetch("/api/user/color", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color }),
      });
      if (!response.ok) throw new Error("Failed to update color");
    } catch (error) {
      console.error("Error updating color:", error);
      alert("Failed to update color");
    }
  };

  return (
    <header className="bg-blue-950 shadow-md p-4 flex justify-between items-center">
      <button
        onClick={() => router.push("/")}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Home
      </button>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-center mx-4">
              Welcome, {session.user.name}!
            </span>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
              style={{ backgroundColor: selectedColor }}
            >
              Pick Color
            </button>
            <button
              onClick={signOut}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
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
          setSelectedColor(color);
          setShowColorPicker(false);
        }}
        initialColor={selectedColor}
      />
    </header>
  );
}
