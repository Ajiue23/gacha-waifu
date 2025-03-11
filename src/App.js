"use client";

import { useState } from "react";
import GachaButton from "./components/GachaButton";
import WaifuCard from "./components/WaifuCard";
import HistoryDrawer from "./components/HistoryDrawer";

const App = () => {
  const [selectedWaifu, setSelectedWaifu] = useState(null);
  const [pullingAnimation, setPullingAnimation] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const waifus = [
    {
      name: "Waifu 1",
      image: "/assets/waifus/waifu1.jpg",
      rarity: "SSR",
      description: "A legendary character with exceptional abilities.",
    },
    {
      name: "Waifu 2",
      image: "/assets/waifus/waifu2.jpg",
      rarity: "SR",
      description: "A rare character with special powers.",
    },
    {
      name: "Waifu 3",
      image: "/assets/waifus/waifu3.jpg",
      rarity: "R",
      description: "A common but valuable character.",
    },
  ];

  const handleGacha = () => {
    setPullingAnimation(true);

    // Simulate gacha pull with delay for animation
    setTimeout(() => {
      const randomWaifu = waifus[Math.floor(Math.random() * waifus.length)];
      setSelectedWaifu(randomWaifu);
      setHistory((prev) => [randomWaifu, ...prev].slice(0, 10));
      setPullingAnimation(false);
    }, 1500);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Gacha Waifu</h1>
        <p className="text-purple-300 max-w-md mx-auto">Try your luck and pull a random character!</p>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <GachaButton onClick={handleGacha} isAnimating={pullingAnimation} />

        {pullingAnimation ? (
          <div className="mt-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-t-transparent border-purple-500 animate-spin" />
            <p className="mt-4 text-purple-300">Summoning character...</p>
          </div>
        ) : selectedWaifu ? (
          <div className="mt-8 w-full">
            <WaifuCard waifu={selectedWaifu} />
          </div>
        ) : null}

        {/* History button */}
        {history.length > 0 && (
          <button onClick={() => setShowHistory(true)} className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-purple-800/50 hover:bg-purple-700/50 transition-colors">
            <span>📜</span> View History
          </button>
        )}
      </div>

      {/* History drawer */}
      {showHistory && <HistoryDrawer history={history} onClose={() => setShowHistory(false)} />}

      {/* Footer */}
      <div className="absolute bottom-4 text-sm text-purple-400/60">© 2023 Gacha Waifu Simulator</div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
