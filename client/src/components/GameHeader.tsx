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
      className="glass rounded-2xl p-6 mb-6 gpu-accelerated"
      {...ANIMATION_VARIANTS.slideDown}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.span 
              className="text-4xl mr-3 animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              📚
            </motion.span>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                KidRead
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Учимся читать весело
              </p>
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">
                Прогресс за сегодня
              </p>
              <p className={`text-sm font-semibold ${achievementStatus.color}`}>
                {achievementStatus.text}
              </p>
            </div>
            
            {/* Modern Progress Bar */}
            <div className="relative">
              <div className="bg-muted/50 rounded-full h-3 w-32 overflow-hidden backdrop-blur-sm">
                <motion.div 
                  className={`bg-gradient-to-r ${achievementStatus.bgColor} rounded-full h-3 relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    delay: 0.3
                  }}
                >
                  {/* Shimmer effect for active progress */}
                  {progressPercentage > 0 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.div>
              </div>
              
              {/* Celebration sparks when goal is reached */}
              {isGoalReached && (
                <motion.div 
                  className="absolute -top-1 -right-1 text-yellow-400"
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
                  ⭐
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Settings Button */}
          <motion.button 
            onClick={onSettingsClick}
            className="btn-modern px-6 py-3 text-white font-semibold text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="mr-2">⚙️</span>
            <span className="hidden sm:inline">Настройки</span>
          </motion.button>
        </div>

        {/* Session Progress Indicator */}
        {totalWords > 0 && (
          <motion.div 
            className="mt-4 pt-4 border-t border-border/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Слово в сессии</span>
              <span className="font-medium">
                {Math.min(currentWordIndex + 1, totalWords)} из {totalWords}
              </span>
            </div>
            <div className="mt-2 bg-muted/30 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-accent to-yellow-500 rounded-full h-1.5"
                initial={{ width: 0 }}
                animate={{ 
                  width: totalWords > 0 ? `${((currentWordIndex + 1) / totalWords) * 100}%` : '0%' 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
