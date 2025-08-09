export const PICTURE_EMOJIS: Record<string, string> = {
  // Animals
  'elephant': '🐘',
  'cat': '🐱',
  'dog': '🐕',
  'fox': '🦊',
  'rabbit': '🐰',
  'bear': '🐻',
  'wolf': '🐺',
  'frog': '🐸',
  'fish': '🐟',
  'bird': '🐦',
  'butterfly': '🦋',
  'bee': '🐝',
  
  // Objects
  'house': '🏠',
  'ball': '⚽',
  'table': '🪑',
  'flower': '🌸',
  'car': '🚗',
  'tree': '🌳',
  'book': '📚',
  'pencil': '✏️',
  'chair': '🪑',
  'window': '🪟',
  'door': '🚪',
  'lamp': '💡',
  'clock': '🕐',
  'phone': '📱',
  'tv': '📺',
  'computer': '💻',
  
  // Transportation
  'airplane': '✈️',
  'train': '🚂',
  'bus': '🚌',
  'bicycle': '🚲',
  'ship': '🚢',
  
  // Nature
  'sun': '☀️',
  'moon': '🌙',
  'star': '⭐',
  'cloud': '☁️',
  'rain': '🌧️',
  'snow': '❄️',
  
  // Food
  'bread': '🍞',
  'milk': '🥛',
  'apple': '🍎',
  'banana': '🍌',
  'orange': '🍊',
  'grapes': '🍇',
  'strawberry': '🍓',
  'watermelon': '🍉',
  'icecream': '🍦',
  'candy': '🍬',
  'cake': '🎂',
  'juice': '🧃',
  
  // People
  'mom': '👩',
  'dad': '👨',
  'baby': '👶',
  'boy': '👦',
  'girl': '👧',
  'grandma': '👵',
  'grandpa': '👴',
  'family': '👨‍👩‍👧‍👦',
  
  // Places
  'school': '🏫',
  'park': '🏞️',
  
  // Activities
  'game': '🎮'
} as const;

export const CELEBRATION_MESSAGES = [
  'Отлично! 🎉',
  'Молодец! ⭐',
  'Супер! 🌟',
  'Правильно! ✨',
  'Умница! 🎊',
  'Здорово! 🎯',
  'Прекрасно! 💫',
  'Чудесно! 🌈',
  'Великолепно! 🏆',
  'Браво! 👏'
] as const;

export const GAME_CONFIG = {
  celebrationDuration: 2000,
  incorrectFeedbackDuration: 1500,
  autoAdvanceDelay: 500,
  animationDuration: 300,
  dragThreshold: 5,
  dailyGoal: 20,
  cacheTime: {
    words: 2 * 60 * 1000, // 2 minutes
    progress: 30 * 1000, // 30 seconds
    gameData: 5 * 60 * 1000, // 5 minutes
  }
} as const;

export const AUDIO_CONFIG = {
  defaultVolume: 0.7,
  fadeInDuration: 100,
  fadeOutDuration: 200,
} as const;

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] }
  },
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.3, ease: [0.19, 1, 0.22, 1] }
  },
  scaleSpring: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 },
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  }
} as const;