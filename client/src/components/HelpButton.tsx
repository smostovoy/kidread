import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type GameType } from "@shared/schema";

interface HelpButtonProps {
  gameType: GameType;
  currentMixType?: string;
}

const GAME_INSTRUCTIONS: Record<string, string> = {
  'picture-match': 'Посмотри на слово и найди правильную картинку. Нажми на картинку, которая соответствует слову.',
  'missing-letter': 'В слове пропущена одна буква. Выбери правильную букву из предложенных вариантов.',
  'extra-letter': 'В слове есть лишняя буква. Найди и нажми на лишнюю букву, чтобы убрать её.',
  'spell-word': 'Посмотри на картинку и составь слово. Перетаскивай буквы или нажимай на них, чтобы написать слово.',
  'mix': 'В этом режиме каждое новое слово будет другой игрой. Следуй инструкциям для каждого задания.'
};

export function HelpButton({ gameType, currentMixType }: HelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false);

  const getInstructions = () => {
    if (gameType === 'mix' && currentMixType) {
      return GAME_INSTRUCTIONS[currentMixType] || GAME_INSTRUCTIONS['mix'];
    }
    return GAME_INSTRUCTIONS[gameType] || 'Следуй инструкциям на экране.';
  };

  return (
    <>
      {/* Help Button */}
      <motion.button
        className="w-12 h-12 bg-blue-500 text-white rounded-full text-xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHelp(!showHelp)}
      >
        ?
      </motion.button>

      {/* Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Как играть</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {getInstructions()}
              </p>
              <motion.button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(false)}
              >
                Понятно!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}