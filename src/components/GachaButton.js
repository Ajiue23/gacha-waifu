"use client";

const GachaButton = ({ onClick, isAnimating }) => {
  return (
    <button onClick={onClick} disabled={isAnimating} className="relative group" style={{ transform: isAnimating ? "scale(0.95)" : "scale(1)" }}>
      {/* Button glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-75 blur-md group-hover:opacity-100 transition-opacity" />

      {/* Main button */}
      <div className="relative px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-lg shadow-lg flex items-center gap-2 transition-all">
        <span>✨</span>
        {isAnimating ? "Summoning..." : "Pull Gacha"}
      </div>

      {/* Sparkle effects */}
      {!isAnimating && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
        </>
      )}
    </button>
  );
};

export default GachaButton;
