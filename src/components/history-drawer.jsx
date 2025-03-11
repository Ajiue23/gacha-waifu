"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const HistoryDrawer = ({ history, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="w-full max-w-md bg-gray-900 h-full overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-xl font-bold">Pull History</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No history yet</p>
          ) : (
            history.map((waifu, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={waifu.image || "/placeholder.svg"}
                    alt={waifu.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100?text=?";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{waifu.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${waifu.rarity === "SSR" ? "bg-yellow-500/20 text-yellow-300" : waifu.rarity === "SR" ? "bg-blue-500/20 text-blue-300" : "bg-gray-500/20 text-gray-300"}`}>
                      {waifu.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{waifu.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HistoryDrawer;
