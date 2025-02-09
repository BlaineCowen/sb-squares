import { useState } from "react";

export default function SelectionModal({ isOpen, onClose, onConfirm, price }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg text-black">
        <h2 className="text-xl font-bold mb-4 text-black">
          Confirm Square Selection
        </h2>
        <div className="mb-4">
          <label className="block mb-2">Price per square: ${price}</label>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(price)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
