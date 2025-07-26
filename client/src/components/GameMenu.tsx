import { motion } from "framer-motion";
import { type GameType } from "@shared/schema";

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
}

export function GameMenu({ currentGameType, onGameTypeChange }: GameMenuProps) {
  return (
    <div className="flex gap-2 mb-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onGameTypeChange('picture-match')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentGameType === 'picture-match'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Картинки
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onGameTypeChange('missing-letter')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentGameType === 'missing-letter'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Буквы
      </motion.button>
    </div>
  );
}