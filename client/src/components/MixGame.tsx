import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Word, type GameType } from "@shared/schema";
import { WordDisplay } from "./WordDisplay";
import { PictureGrid } from "./PictureGrid";
import { MissingLetterGame } from "./MissingLetterGame";
import { ExtraLetterGame } from "./ExtraLetterGame";
import { SpellWordGame } from "./SpellWordGame";
import { motion } from "framer-motion";

interface MixGameProps {
  word: Word;
  onAnswer: (isCorrect: boolean) => void;
  disabled: boolean;
}

export function MixGame({ word, onAnswer, disabled }: MixGameProps) {
  // Randomly select game type for this word
  const [currentMixType, setCurrentMixType] = useState<GameType>(() => {
    const gameTypes: GameType[] = ['picture-match', 'missing-letter', 'extra-letter', 'spell-word'];
    return gameTypes[Math.floor(Math.random() * gameTypes.length)];
  });

  // Reset game type when word changes
  useEffect(() => {
    const gameTypes: GameType[] = ['picture-match', 'missing-letter', 'extra-letter', 'spell-word'];
    setCurrentMixType(gameTypes[Math.floor(Math.random() * gameTypes.length)]);
  }, [word.id]);

  // Fetch data based on current mix type
  const { data: distractors = [], isLoading: distractorsLoading } = useQuery<Word[]>({
    queryKey: ["/api/words", word.id, "distractors"],
    enabled: currentMixType === 'picture-match',
  });

  const { data: letterData, isLoading: letterOptionsLoading } = useQuery<{
    letterOptions: string[];
    missingLetterIndex: number;
    correctLetter: string;
  }>({
    queryKey: ["/api/words", word.id, "letter-options"],
    enabled: currentMixType === 'missing-letter',
  });

  const { data: extraLetterData, isLoading: extraLetterLoading } = useQuery<{
    wordWithExtraLetter: string;
    extraLetterIndex: number;
    extraLetter: string;
  }>({
    queryKey: ["/api/words", word.id, "extra-letter"],
    enabled: currentMixType === 'extra-letter',
  });

  const { data: spellLettersData, isLoading: spellLettersLoading } = useQuery<{
    availableLetters: string[];
  }>({
    queryKey: ["/api/words", word.id, "spell-letters"],
    enabled: currentMixType === 'spell-word',
  });

  const handlePictureSelect = (selectedWord: Word, isCorrect: boolean) => {
    onAnswer(isCorrect);
  };

  const handleLetterSelect = (letter: string, isCorrect: boolean) => {
    onAnswer(isCorrect);
  };

  const handleLetterRemove = (letterIndex: number, isCorrect: boolean) => {
    onAnswer(isCorrect);
  };

  const handleWordComplete = (isCorrect: boolean) => {
    onAnswer(isCorrect);
  };

  // Show loading if data is still loading
  if ((currentMixType === 'picture-match' && distractorsLoading) ||
      (currentMixType === 'missing-letter' && letterOptionsLoading) ||
      (currentMixType === 'extra-letter' && extraLetterLoading) ||
      (currentMixType === 'spell-word' && spellLettersLoading)) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-xl text-child-text">Подготавливаем задание...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Show current game type indicator */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2"
        >
          <span className="text-2xl">🎲</span>
          <span className="text-sm font-medium text-blue-800">Микс режим</span>
        </motion.div>
      </div>

      {currentMixType === 'picture-match' && (
        <>
          <WordDisplay word={word.word} />
          
          <PictureGrid
            correctWord={word}
            distractors={distractors}
            onPictureSelect={handlePictureSelect}
            disabled={disabled}
          />

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

      {currentMixType === 'missing-letter' && letterData && (
        <MissingLetterGame
          word={word}
          letterOptions={letterData.letterOptions}
          missingLetterIndex={letterData.missingLetterIndex}
          onLetterSelect={handleLetterSelect}
          disabled={disabled}
        />
      )}

      {currentMixType === 'extra-letter' && extraLetterData && (
        <ExtraLetterGame
          word={word}
          wordWithExtraLetter={extraLetterData.wordWithExtraLetter}
          extraLetterIndex={extraLetterData.extraLetterIndex}
          onLetterRemove={handleLetterRemove}
          disabled={disabled}
        />
      )}

      {currentMixType === 'spell-word' && spellLettersData && (
        <SpellWordGame
          word={word}
          availableLetters={spellLettersData.availableLetters}
          onWordComplete={handleWordComplete}
          disabled={disabled}
        />
      )}
    </div>
  );
}