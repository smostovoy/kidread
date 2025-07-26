import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import { useEffect } from "react";

interface CelebrationOverlayProps {
  isVisible: boolean;
  onNext: () => void;
}

export function CelebrationOverlay({ isVisible, onNext }: CelebrationOverlayProps) {
  const { playApplause } = useAudio();

  useEffect(() => {
    if (isVisible) {
      playApplause();
    }
  }, [isVisible, playApplause]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 celebration-overlay z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            {/* Fireworks Effects */}
            <div className="relative">
              <motion.div 
                className="star text-6xl absolute"
                style={{ top: -100, left: -50 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 1, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⭐
              </motion.div>
              <motion.div 
                className="star text-4xl absolute"
                style={{ top: -80, right: -30 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                ✨
              </motion.div>
              <motion.div 
                className="star text-5xl absolute"
                style={{ bottom: -90, left: -40 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                🌟
              </motion.div>
              <motion.div 
                className="star text-3xl absolute"
                style={{ bottom: -70, right: -60 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                💫
              </motion.div>
            </div>
            
            {/* Success Message */}
            <motion.div 
              className="bg-white rounded-3xl p-8 shadow-2xl mx-4"
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <motion.div 
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                🎉
              </motion.div>
              <h2 className="text-4xl font-bold text-secondary mb-4">Отлично!</h2>
              <p className="text-2xl text-child-text mb-6">Ты правильно выбрал картинку!</p>
              
              {/* Applause Animation */}
              <div className="flex justify-center space-x-4 mb-6">
                {[0, 0.2, 0.4].map((delay, index) => (
                  <motion.span
                    key={index}
                    className="text-4xl"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: delay
                    }}
                  >
                    👏
                  </motion.span>
                ))}
              </div>
              
              <motion.button
                onClick={onNext}
                className="bg-primary hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Следующее слово! 🚀
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
