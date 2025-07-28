import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Word, type GameType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { GameHeader } from "@/components/GameHeader";
import { GameMenu } from "@/components/GameMenu";
import { WordDisplay } from "@/components/WordDisplay";
import { PictureGrid } from "@/components/PictureGrid";
import { MissingLetterGame } from "@/components/MissingLetterGame";
import { ExtraLetterGame } from "@/components/ExtraLetterGame";
import { SpellWordGame } from "@/components/SpellWordGame";
import { MixGame } from "@/components/MixGame";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Game() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<Word | null>(null);
  const [gameType, setGameType] = useState<GameType>('picture-match');
  const [sessionId] = useState(() => {
    // Check if we have a session ID in localStorage
    const stored = localStorage.getItem('russian-game-session');
    if (stored) {
      return stored;
    }
    // Create new session ID and store it
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('russian-game-session', newSessionId);
    return newSessionId;
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available words (excluding correctly answered ones)
  const { data: words = [], isLoading: wordsLoading } = useQuery<Word[]>({
    queryKey: ["/api/words", sessionId],
    queryFn: () => fetch(`/api/words?sessionId=${sessionId}`).then(res => res.json()),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch today's progress
  const { data: todayProgress, isLoading: progressLoading } = useQuery<{ correctAnswersToday: number }>({
    queryKey: ["/api/progress/today", sessionId],
    queryFn: () => fetch(`/api/progress/today?sessionId=${sessionId}`).then(res => res.json()),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get current word
  const currentWord = words[currentWordIndex];

  // Fetch distractors for current word (picture-match mode)
  const { data: distractors = [], isLoading: distractorsLoading } = useQuery<Word[]>({
    queryKey: ["/api/words", currentWord?.id, "distractors"],
    enabled: !!currentWord?.id && gameType === 'picture-match',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch letter options for current word (missing-letter mode)
  const { data: letterData, isLoading: letterOptionsLoading } = useQuery<{
    letterOptions: string[];
    missingLetterIndex: number;
    correctLetter: string;
  }>({
    queryKey: ["/api/words", currentWord?.id, "letter-options"],
    enabled: !!currentWord?.id && gameType === 'missing-letter',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch extra letter data for current word (extra-letter mode)
  const { data: extraLetterData, isLoading: extraLetterLoading } = useQuery<{
    wordWithExtraLetter: string;
    extraLetterIndex: number;
    extraLetter: string;
  }>({
    queryKey: ["/api/words", currentWord?.id, "extra-letter"],
    enabled: !!currentWord?.id && gameType === 'extra-letter',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch spell letters for current word (spell-word mode)
  const { data: spellLettersData, isLoading: spellLettersLoading } = useQuery<{
    availableLetters: string[];
  }>({
    queryKey: ["/api/words", currentWord?.id, "spell-letters"],
    enabled: !!currentWord?.id && gameType === 'spell-word',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle mix game answers
  const handleMixAnswer = (isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;
    
    setSelectedPicture({ id: 'mix-complete', word: 'mix-complete', image: '', audio: '' } as Word);
    
    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
      });
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  // Mutation to record user answers
  const recordAnswerMutation = useMutation({
    mutationFn: (answerData: { wordId: string; isCorrect: boolean; sessionId: string }) =>
      fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerData),
      }).then(res => res.json()),
    onSuccess: (data, variables) => {
      // Only invalidate today's progress when answer is correct
      if (variables.isCorrect) {
        queryClient.invalidateQueries({ queryKey: ["/api/progress/today", sessionId] });
      }
    }
  });

  const handlePictureSelect = (word: Word, isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;
    
    setSelectedPicture(word);
    
    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
      });
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleLetterSelect = (letter: string, isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;
    
    setSelectedPicture({ id: letter, word: letter, image: '', audio: '' } as Word);
    
    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
      });
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleLetterRemove = (letterIndex: number, isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;
    
    setSelectedPicture({ id: `remove-${letterIndex}`, word: `remove-${letterIndex}`, image: '', audio: '' } as Word);
    
    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
      });
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleWordComplete = (isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;
    
    setSelectedPicture({ id: 'spell-complete', word: 'spell-complete', image: '', audio: '' } as Word);
    
    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
      });
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleNextWord = () => {
    setShowCelebration(false);
    setSelectedPicture(null);
    
    // Invalidate words query to get updated list (after celebration is done)
    queryClient.invalidateQueries({ queryKey: ["/api/words", sessionId] });
    
    if (currentWordIndex + 1 >= words.length) {
      setGameCompleted(true);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleSettingsClick = () => {
    toast({
      title: "Настройки 🔧",
      description: "Чтобы сбросить прогресс и начать заново, нажмите здесь",
      action: (
        <button
          onClick={handleResetProgress}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
        >
          Сбросить прогресс
        </button>
      ),
    });
  };

  const handleRestartGame = () => {
    setCurrentWordIndex(0);
    setCorrectAnswers(0);
    setShowCelebration(false);
    setGameCompleted(false);
    setSelectedPicture(null);
  };

  const handleResetProgress = () => {
    // Clear the session from localStorage to start fresh
    localStorage.removeItem('russian-game-session');
    // Reload the page to get a new session
    window.location.reload();
  };

  const handleGameTypeChange = (newGameType: GameType) => {
    setGameType(newGameType);
    setSelectedPicture(null);
    setShowCelebration(false);
  };

  if (wordsLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            📚
          </motion.div>
          <p className="text-2xl font-bold text-child-text">Загружаем слова...</p>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-4xl font-bold text-primary mb-4">Поздравляем!</h1>
          <p className="text-2xl text-child-text mb-4">
            Ты прошёл все слова!
          </p>
          <p className="text-xl text-secondary mb-6 font-semibold">
            Сегодня правильных ответов: {todayProgress?.correctAnswersToday || 0}
          </p>
          
          <div className="space-y-4">
            <motion.button
              onClick={handleRestartGame}
              className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Играть снова! 🎮
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading only if we don't have the current word at all
  const isInitialLoading = !currentWord;
    
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-child-text">Подготавливаем задание...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GameHeader
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
        correctAnswersToday={todayProgress?.correctAnswersToday || 0}
        onSettingsClick={handleSettingsClick}
      />

      <main className="max-w-6xl mx-auto px-4 pb-8">
        <GameMenu 
          currentGameType={gameType}
          onGameTypeChange={handleGameTypeChange}
        />

        {gameType === 'picture-match' && (
          <>
            <WordDisplay word={currentWord.word} />
            
            {distractorsLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl">⏳</div>
                <p className="text-sm text-gray-500">Загружаем варианты...</p>
              </div>
            ) : (
              <PictureGrid
                correctWord={currentWord}
                distractors={distractors}
                onPictureSelect={handlePictureSelect}
                disabled={!!selectedPicture || showCelebration}
              />
            )}

            <div className="text-center mt-8">
              <motion.div
                className="text-6xl"
                animate={{ 
                  rotate: [-10, 10, -10],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                👆
              </motion.div>
            </div>
          </>
        )}

        {gameType === 'missing-letter' && (
          letterOptionsLoading ? (
            <div className="text-center py-8">
              <div className="text-2xl">⏳</div>
              <p className="text-sm text-gray-500">Подготавливаем буквы...</p>
            </div>
          ) : letterData ? (
            <MissingLetterGame
              word={currentWord}
              letterOptions={letterData.letterOptions}
              missingLetterIndex={letterData.missingLetterIndex}
              onLetterSelect={handleLetterSelect}
              disabled={!!selectedPicture || showCelebration}
            />
          ) : null
        )}

        {gameType === 'extra-letter' && (
          extraLetterLoading ? (
            <div className="text-center py-8">
              <div className="text-2xl">⏳</div>
              <p className="text-sm text-gray-500">Создаем задание...</p>
            </div>
          ) : extraLetterData ? (
            <ExtraLetterGame
              word={currentWord}
              wordWithExtraLetter={extraLetterData.wordWithExtraLetter}
              extraLetterIndex={extraLetterData.extraLetterIndex}
              onLetterRemove={handleLetterRemove}
              disabled={!!selectedPicture || showCelebration}
            />
          ) : null
        )}

        {gameType === 'spell-word' && (
          spellLettersLoading ? (
            <div className="text-center py-8">
              <div className="text-2xl">⏳</div>
              <p className="text-sm text-gray-500">Готовим буквы...</p>
            </div>
          ) : spellLettersData ? (
            <SpellWordGame
              word={currentWord}
              availableLetters={spellLettersData.availableLetters}
              onWordComplete={handleWordComplete}
              disabled={!!selectedPicture || showCelebration}
            />
          ) : null
        )}

        {gameType === 'mix' && (
          <MixGame
            word={currentWord}
            onAnswer={handleMixAnswer}
            disabled={!!selectedPicture || showCelebration}
          />
        )}
      </main>

      <CelebrationOverlay
        key={`celebration-${currentWord?.id}-${correctAnswers}`}
        isVisible={showCelebration}
        onNext={handleNextWord}
      />
    </div>
  );
}
