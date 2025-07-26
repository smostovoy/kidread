import { motion } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface WordDisplayProps {
  word: string;
}

export function WordDisplay({ word }: WordDisplayProps) {
  const { playLetterSound } = useAudio();

  const handleLetterClick = (letter: string) => {
    playLetterSound(letter);
  };

  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-child-text mb-6">
        Найди картинку к слову:
      </h2>
      
      <div className="flex justify-center space-x-4 mb-8">
        {word.split('').map((letter, index) => (
          <motion.button
            key={`${letter}-${index}`}
            onClick={() => handleLetterClick(letter)}
            className="letter-button bg-white border-4 border-primary text-primary font-bold text-6xl w-20 h-20 rounded-2xl shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {letter}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
