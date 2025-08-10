# KidRead - Claude Development Guidelines

## Database and Constants Synchronization Rules

### Emoji Management
- **Rule**: Database and constants must always be in sync
- **Implementation**: Words in the database should only reference image keys that exist in `PICTURE_EMOJIS` constants
- **Action when emoji is not suitable**: If an emoji doesn't properly represent the word concept, remove both:
  1. The emoji entry from `client/src/lib/constants.ts` 
  2. The corresponding word(s) from the database
- **Fallback**: Words without emoji mappings will display ❓ as fallback

### Development Server
- **Port**: Use port 3456 for development
- **Command**: `DATABASE_URL="..." PORT=3456 npm run dev`
- **Database**: Requires Supabase connection string in DATABASE_URL

### UI Design Principles
- **Target Audience**: Children learning to read
- **Text Usage**: Avoid text where possible - children cannot read yet
- **Visual Communication**: Use emojis and visual elements for navigation
- **Exceptions**: Keep essential text like "KidRead" and "Настройки" (Settings)

### Drag and Drop Implementation
- **Library**: Use @dnd-kit/core for all drag-and-drop functionality
- **Compatibility**: Ensures proper touch support on iPad and mobile devices
- **Components**: 
  - SpellWordGame: Letter placement with drag-and-drop
  - ExtraLetterGame: Drag letters to trash
  - MissingLetterGame: Drag letters to fill gaps

### Code Organization
- **Shared Constants**: All emoji mappings in `client/src/lib/constants.ts`
- **No Duplicates**: Remove duplicate PICTURE_EMOJIS from individual components
- **Import Pattern**: `import { PICTURE_EMOJIS } from "@/lib/constants"`