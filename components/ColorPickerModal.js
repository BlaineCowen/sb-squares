import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

export default function ColorPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialColor,
}) {
  const [color, setColor] = useState(null);

  useEffect(() => {
    setColor(initialColor);
  }, [initialColor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white backdrop-blur-xl bg-opacity-90 p-8 rounded-2xl shadow-2xl animate-slide-in">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
          Choose Your Color
        </h3>

        <HexColorPicker color={color || "#22c55e"} onChange={setColor} />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(color);
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold shadow-lg hover:shadow-blue-500/30"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
