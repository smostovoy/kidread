# Russian Reading Game App

## Overview

This is a child-friendly Russian reading game built with React, TypeScript, Express.js, and Drizzle ORM. The app teaches children to read Russian words by matching them with corresponding pictures. It features an interactive game interface with audio pronunciation, visual feedback, and progress tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React 18 with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured for Neon Database)
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth UI transitions

### Monorepo Structure
The project uses a monorepo structure with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schemas
- `migrations/` - Database migration files

## Key Components

### Frontend Components
- **Game**: Main game interface with word display and picture selection
- **GameHeader**: Progress tracking and navigation
- **WordDisplay**: Interactive letter buttons with audio pronunciation
- **PictureGrid**: Grid of picture options for word matching
- **CelebrationOverlay**: Success animations and feedback
- **Audio Hook**: Web Speech API integration for Russian pronunciation

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Handlers**: CRUD operations for words and game progress
- **Development Server**: Integrated Vite development server with HMR

### Database Schema
- **Words Table**: Stores Russian words with associated images and audio files
- **Game Progress Table**: Tracks user progress through game sessions
- **Shared Types**: TypeScript interfaces generated from Drizzle schemas

## Data Flow

1. **Game Initialization**: Frontend fetches word list from `/api/words`
2. **Word Selection**: Random word chosen from available words
3. **Distractor Generation**: Backend provides incorrect options via `/api/words/:id/distractors`
4. **User Interaction**: Picture selection triggers validation and feedback
5. **Progress Tracking**: Game state managed locally with optional backend sync
6. **Audio Feedback**: Web Speech API provides Russian pronunciation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for smooth UI transitions
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **Vite**: Fast build tool with TypeScript support
- **ESBuild**: Production build bundling for server code
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library

### Audio System
- **Web Speech API**: Browser-native Russian text-to-speech
- **Fallback Strategy**: Graceful degradation when speech synthesis unavailable

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public/`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations run via `npm run db:push`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **REPL_ID**: Replit-specific development features

### Development Workflow
- **Hot Module Replacement**: Vite provides instant frontend updates
- **Server Restart**: tsx enables TypeScript execution with auto-restart
- **Database Sync**: Drizzle push for schema synchronization

### Production Considerations
- Server-side rendering disabled (CSR only)
- Static asset serving from Express in production
- Error handling with proper HTTP status codes
- Request logging and performance monitoring

## Game Features

### Educational Design
- **Child-Friendly Interface**: Large buttons, bright colors, emoji icons
- **Russian Language Support**: Cyrillic characters with phonetic audio
- **Progressive Difficulty**: Starts with simple 3-letter words
- **Immediate Feedback**: Visual and audio responses to user actions

### Interactive Elements
- **Clickable Letters**: Each letter plays pronunciation sound
- **Picture Matching**: Visual word-to-image association
- **Celebration Animations**: Positive reinforcement for correct answers
- **Error Handling**: Encouraging "try again" feedback

### Accessibility
- **Keyboard Navigation**: Full keyboard support for interactions
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Mobile Responsive**: Touch-friendly interface for tablets
- **High Contrast**: Clear visual distinctions for readability