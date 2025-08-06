import { useState } from 'react';

// Simple click-based fallback for iOS devices that have touch issues
export function useSimpleTouchFallback() {
  const [selectedLetter, setSelectedLetter] = useState<{letter: string, index?: number} | null>(null);

  const selectLetter = (letter: string, index?: number) => {
    setSelectedLetter({ letter, index });
  };

  const clearSelection = () => {
    setSelectedLetter(null);
  };

  const useSelection = (onDrop: (letter: string, index?: number) => void) => {
    if (selectedLetter) {
      onDrop(selectedLetter.letter, selectedLetter.index);
      clearSelection();
    }
  };

  return {
    selectedLetter,
    selectLetter,
    clearSelection,
    useSelection,
  };
}