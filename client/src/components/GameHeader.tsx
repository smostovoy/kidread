import { motion } from "framer-motion";
import { useMemo } from "react";
import { GAME_CONFIG, ANIMATION_VARIANTS } from "@/lib/constants";

interface GameHeaderProps {
  currentWordIndex: number;
  totalWords: number;
  correctAnswersToday: number;
  onSettingsClick: () => void;
}

export function GameHeader({ currentWordIndex, totalWords, correctAnswersToday, onSettingsClick }: GameHeaderProps) {
  // Calculate progress based on today's correct answers
  const targetAnswers = GAME_CONFIG.dailyGoal;
  const progressPercentage = Math.min((correctAnswersToday / targetAnswers) * 100, 100);
  const isGoalReached = correctAnswersToday >= targetAnswers;

  // Memoize achievement status to prevent unnecessary re-renders
  const achievementStatus = useMemo(() => {
    if (isGoalReached) {
      return {
        text: 'Цель достигнута! 🎉',
        color: 'text-green-600',
        bgColor: 'from-green-400 to-green-500'
      };
    }
    if (correctAnswersToday >= targetAnswers * 0.75) {
      return {
        text: 'Почти готово!',
        color: 'text-orange-600',
        bgColor: 'from-orange-400 to-orange-500'
      };
    }
    return {
      text: `${correctAnswersToday}/${targetAnswers}`,
      color: 'text-primary',
      bgColor: 'from-primary to-purple-500'
    };
  }, [correctAnswersToday, targetAnswers, isGoalReached]);

  return (
    <motion.header 
      className="glass rounded-2xl p-2 mb-3 gpu-accelerated"
      {...ANIMATION_VARIANTS.slideDown}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo with KidRead */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-2xl mr-2">📚</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              KidRead
            </h1>
          </motion.div>

          {/* Visual Progress - Icons Only */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Daily Progress with Stars */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${achievementStatus.color}`}>
                  {correctAnswersToday}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{targetAnswers}</span>
              </div>
              <div className="bg-muted/50 rounded-full h-2 w-16 overflow-hidden">
                <motion.div 
                  className={`bg-gradient-to-r ${achievementStatus.bgColor} rounded-full h-2`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              {isGoalReached && (
                <motion.span
                  className="text-xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ 
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  🎉
                </motion.span>
              )}
            </div>

            {/* Session Progress with Game Icons */}
            {totalWords > 0 && (
              <div className="flex items-center gap-2 border-l border-border/50 pl-4">
                <span className="text-lg">🎮</span>
                <span className="text-sm font-bold">
                  {Math.min(currentWordIndex + 1, totalWords)}
                </span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {totalWords}
                </span>
              </div>
            )}
          </motion.div>

          {/* Settings with Text */}
          <motion.button 
            onClick={onSettingsClick}
            className="btn-modern px-3 py-2 text-white text-sm font-medium flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="mr-2">⚙️</span>
            <span>Настройки</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
