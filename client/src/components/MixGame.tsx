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
  onMixTypeChange?: (mixType: string) => void;
}

const GAME_TYPE_NAMES: Record<Exclude<GameType, 'mix'>, string> = {
  'picture-match': 'Найди картинку',
  'missing-letter': 'Найди букву',
  'extra-letter': 'Убери лишнее',
  'spell-word': 'Составь слово'
};

const GAME_TYPE_ICONS: Record<Exclude<GameType, 'mix'>, string> = {
  'picture-match': '🖼️',
  'missing-letter': '🔍',
  'extra-letter': '🗑️',
  'spell-word': '✏️'
};

export function MixGame({ word, onAnswer, disabled, onMixTypeChange }: MixGameProps) {
  // Randomly select game type for this word
  const [currentMixType, setCurrentMixType] = useState<Exclude<GameType, 'mix'>>(() => {
    const gameTypes: Array<Exclude<GameType, 'mix'>> = ['picture-match', 'missing-letter', 'extra-letter', 'spell-word'];
    return gameTypes[Math.floor(Math.random() * gameTypes.length)];
  });

  // Reset game type when word changes
  useEffect(() => {
    const gameTypes: Array<Exclude<GameType, 'mix'>> = ['picture-match', 'missing-letter', 'extra-letter', 'spell-word'];
    const newType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    setCurrentMixType(newType);
    onMixTypeChange?.(newType);
  }, [word.id, onMixTypeChange]);

  // Notify parent of initial mix type
  useEffect(() => {
    onMixTypeChange?.(currentMixType);
  }, [currentMixType, onMixTypeChange]);

  // Fetch data based on current mix type
  const { data: distractors = [], isLoading: distractorsLoading } = useQuery<Word[]>({
    queryKey: ["/api/words", word.id, "distractors"],
    enabled: currentMixType === 'picture-match',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: letterData, isLoading: letterOptionsLoading } = useQuery<{
    letterOptions: string[];
    missingLetterIndex: number;
    correctLetter: string;
  }>({
    queryKey: ["/api/words", word.id, "letter-options"],
    enabled: currentMixType === 'missing-letter',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: extraLetterData, isLoading: extraLetterLoading } = useQuery<{
    wordWithExtraLetter: string;
    extraLetterIndex: number;
    extraLetter: string;
  }>({
    queryKey: ["/api/words", word.id, "extra-letter"],
    enabled: currentMixType === 'extra-letter',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: spellLettersData, isLoading: spellLettersLoading } = useQuery<{
    availableLetters: string[];
  }>({
    queryKey: ["/api/words", word.id, "spell-letters"],
    enabled: currentMixType === 'spell-word',
    staleTime: 5 * 60 * 1000, // 5 minutes
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



  return (
    <div>
      {/* Show current game type indicator */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2"
        >
          <span className="text-2xl">{GAME_TYPE_ICONS[currentMixType]}</span>
          <span className="text-sm font-medium text-blue-800">{GAME_TYPE_NAMES[currentMixType]}</span>
        </motion.div>
      </div>

      {currentMixType === 'picture-match' && (
        <>
          <WordDisplay word={word.word} />
          
          {distractorsLoading ? (
            <div className="text-center py-8">
              <div className="text-2xl">⏳</div>
              <p className="text-sm text-gray-500">Загружаем варианты...</p>
            </div>
          ) : (
            <PictureGrid
              correctWord={word}
              distractors={distractors}
              onPictureSelect={handlePictureSelect}
              disabled={disabled}
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

      {currentMixType === 'missing-letter' && (
        letterOptionsLoading ? (
          <div className="text-center py-8">
            <div className="text-2xl">⏳</div>
            <p className="text-sm text-gray-500">Подготавливаем буквы...</p>
          </div>
        ) : letterData ? (
          <MissingLetterGame
            word={word}
            letterOptions={letterData.letterOptions}
            missingLetterIndex={letterData.missingLetterIndex}
            onLetterSelect={handleLetterSelect}
            disabled={disabled}
          />
        ) : null
      )}

      {currentMixType === 'extra-letter' && (
        extraLetterLoading ? (
          <div className="text-center py-8">
            <div className="text-2xl">⏳</div>
            <p className="text-sm text-gray-500">Создаем задание...</p>
          </div>
        ) : extraLetterData ? (
          <ExtraLetterGame
            word={word}
            wordWithExtraLetter={extraLetterData.wordWithExtraLetter}
            extraLetterIndex={extraLetterData.extraLetterIndex}
            onLetterRemove={handleLetterRemove}
            disabled={disabled}
          />
        ) : null
      )}

      {currentMixType === 'spell-word' && (
        spellLettersLoading ? (
          <div className="text-center py-8">
            <div className="text-2xl">⏳</div>
            <p className="text-sm text-gray-500">Готовим буквы...</p>
          </div>
        ) : spellLettersData ? (
          <SpellWordGame
            word={word}
            availableLetters={spellLettersData.availableLetters}
            onWordComplete={handleWordComplete}
            disabled={disabled}
          />
        ) : null
      )}
    </div>
  );
}