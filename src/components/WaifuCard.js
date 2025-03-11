const rarityColors = {
  SSR: "text-yellow-400",
  SR: "text-blue-400",
  R: "text-gray-300",
};

const rarityBg = {
  SSR: "from-yellow-500/20 to-amber-700/20",
  SR: "from-blue-500/20 to-indigo-700/20",
  R: "from-gray-500/20 to-gray-700/20",
};

const WaifuCard = ({ waifu }) => {
  const { name, image, rarity = "R", description = "A mysterious character." } = waifu;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b ${rarityBg[rarity]} border border-white/10 shadow-xl`} style={{ animation: "cardFlip 0.6s ease-out" }}>
      {/* Rarity indicator */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 flex items-center gap-1 ${rarityColors[rarity]}`}>
        <span>⭐</span>
        {rarity}
      </div>

      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=Character+Image";
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 -mt-16 p-4">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-gray-300 text-sm">{description}</p>

        {/* Decorative elements */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-1">
            {[...Array(rarity === "SSR" ? 5 : rarity === "SR" ? 3 : 1)].map((_, i) => (
              <span key={i} className={rarityColors[rarity]}>
                ⭐
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-400">
            ID: #
            {Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, "0")}
          </div>
        </div>
      </div>

      {/* CSS for card flip animation */}
      <style jsx>{`
        @keyframes cardFlip {
          0% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WaifuCard;
