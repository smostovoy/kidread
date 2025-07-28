import { motion } from "framer-motion";

interface GameHeaderProps {
  currentWordIndex: number;
  totalWords: number;
  correctAnswers: number;
  onSettingsClick: () => void;
}

export function GameHeader({ currentWordIndex, totalWords, correctAnswers, onSettingsClick }: GameHeaderProps) {
  const progressPercentage = (currentWordIndex / totalWords) * 100;

  return (
    <header className="bg-white shadow-lg p-4 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <span className="text-3xl mr-2">📚</span>
          Kidsread
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="bg-gray-200 rounded-full h-4 w-32 overflow-hidden">
            <motion.div 
              className="bg-secondary rounded-full h-4"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-lg font-semibold text-child-text">
            {currentWordIndex + 1}/{totalWords}
          </span>
        </div>
        
        <button 
          onClick={onSettingsClick}
          className="bg-accent hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
        >
          ⚙️ Настройки
        </button>
      </div>
    </header>
  );
}
