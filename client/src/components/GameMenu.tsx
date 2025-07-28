import { motion } from "framer-motion";
import { type GameType } from "@shared/schema";

const GAME_ICONS: Record<GameType, string> = {
  'picture-match': '🖼️',
  'missing-letter': '❓', 
  'extra-letter': '🗑️',
  'spell-word': '🔤'
};

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
}

export function GameMenu({ currentGameType, onGameTypeChange }: GameMenuProps) {
  const gameTypes: GameType[] = ['picture-match', 'missing-letter', 'extra-letter', 'spell-word'];
  
  return (
    <div className="flex gap-2 mb-4">
      {gameTypes.map((gameType) => (
        <motion.button
          key={gameType}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onGameTypeChange(gameType)}
          className={`w-16 h-16 rounded-xl text-3xl transition-colors flex items-center justify-center ${
            currentGameType === gameType
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {GAME_ICONS[gameType]}
        </motion.button>
      ))}
    </div>
  );
}