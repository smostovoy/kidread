import { motion } from "framer-motion";
import { useDraggable } from '@dnd-kit/core';

interface DraggableLetterProps {
  letter: string;
  index: number;
  disabled?: boolean;
  used?: boolean;
  isRemoved?: boolean;
  theme?: 'blue' | 'purple' | 'gray' | 'red';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'gradient';
  idPrefix?: string;
  onClick?: (letter: string) => void;
}

const themeClasses = {
  blue: {
    solid: 'bg-blue-500 text-white hover:bg-blue-600 border-2 border-blue-500 hover:border-blue-600',
    outline: 'border-2 border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100',
    gradient: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
  },
  purple: {
    solid: 'bg-purple-500 text-white hover:bg-purple-600 border-2 border-purple-500',
    outline: 'border-2 border-purple-400 bg-purple-50 text-purple-600 hover:bg-purple-100',
    gradient: 'bg-gradient-to-br from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500'
  },
  gray: {
    solid: 'bg-gray-300 text-gray-800 hover:bg-gray-400 border-2 border-gray-300',
    outline: 'border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
    gradient: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
  },
  red: {
    solid: 'bg-red-500 text-white hover:bg-red-600 border-2 border-red-500',
    outline: 'border-2 border-red-400 bg-red-50 text-red-600 hover:bg-red-100',
    gradient: 'bg-gradient-to-br from-red-400 to-red-500 text-white'
  }
};

const sizeClasses = {
  sm: 'w-14 h-14 text-2xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-20 h-20 text-4xl'
};

export function DraggableLetter({ 
  letter, 
  index, 
  disabled = false,
  used = false,
  isRemoved = false,
  theme = 'blue',
  size = 'md',
  variant = 'solid',
  idPrefix = 'letter',
  onClick
}: DraggableLetterProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${idPrefix}-${index}`,
    data: { letter, index },
    disabled: disabled || used || isRemoved,
  });

  if (used) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-xl`}
        style={{ visibility: 'hidden' }}
      />
    );
  }

  const baseClasses = `
    draggable-element ${sizeClasses[size]} rounded-xl font-bold 
    transition-all duration-200 cursor-pointer select-none shadow-lg
    flex items-center justify-center
  `;

  const themeClass = themeClasses[theme][variant];
  const stateClasses = disabled 
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
    : isDragging
      ? 'opacity-50 scale-105'
      : isRemoved
        ? 'bg-red-100 text-red-600 border-red-500'
        : themeClass;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${baseClasses} ${stateClasses}`}
      whileHover={!disabled && !used && !isRemoved ? { scale: 1.05 } : {}}
      whileTap={!disabled && !used && !isRemoved ? { scale: 0.95 } : {}}
      initial={isRemoved ? { y: -20, opacity: 0 } : {}}
      animate={
        isRemoved 
          ? { y: -50, opacity: 0, scale: 0.5 } 
          : { y: 0, opacity: 1, scale: 1 }
      }
      transition={{ 
        delay: isRemoved ? 0 : index * 0.1,
        duration: isRemoved ? 0.5 : 0.3
      }}
      onClick={() => onClick?.(letter)}
    >
      {letter}
    </motion.div>
  );
}