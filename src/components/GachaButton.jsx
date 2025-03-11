"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const GachaButton = ({ onClick, isAnimating }) => {
  return (
    <motion.button onClick={onClick} disabled={isAnimating} className="relative group" whileTap={{ scale: 0.95 }}>
      {/* Button glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-75 blur-md group-hover:opacity-100 transition-opacity" />

      {/* Main button */}
      <div className="relative px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-lg shadow-lg flex items-center gap-2 transition-all">
        <Sparkles className="w-5 h-5" />
        {isAnimating ? "Summoning..." : "Pull Gacha"}
      </div>

      {/* Sparkle effects */}
      {!isAnimating && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 0.5,
            }}
          />
        </>
      )}
    </motion.button>
  );
};

export default GachaButton;
