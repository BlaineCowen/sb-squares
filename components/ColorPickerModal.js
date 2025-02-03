import { useState } from "react";
import { HexColorPicker } from "react-colorful";

export default function ColorPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialColor,
}) {
  const [selectedColor, setSelectedColor] = useState(initialColor || "#22c55e");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-medium mb-4">Choose Your Color</h3>

        <HexColorPicker color={selectedColor} onChange={setSelectedColor} />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(selectedColor);
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
