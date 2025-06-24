"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ReportUserModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center px-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Report User</h2>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the issue..."
          className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white mb-4"
          rows={4}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
