import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameProgressSchema, insertUserAnswerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available words (excluding correctly answered ones in last month)
  app.get("/api/words", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || 'default-session';
      const words = await storage.getAvailableWords(sessionId);
      res.json(words);
    } catch (error) {
      console.error("Error fetching words:", error);
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });

  // Get a specific word by ID
  app.get("/api/words/:id", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word" });
    }
  });

  // Get random words for distractors
  app.get("/api/words/:id/distractors", async (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 3;
      const distractors = await storage.getRandomWords(req.params.id, count);
      res.json(distractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch distractors" });
    }
  });

  // Get letter options for missing letter game
  app.get("/api/words/:id/letter-options", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      
      const wordText = word.word;
      const russianLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
      
      // Choose a random position to remove (not first or last position for easier gameplay)
      const missingLetterIndex = Math.floor(Math.random() * (wordText.length - 2)) + 1;
      const correctLetter = wordText[missingLetterIndex];
      
      // Generate 3 random incorrect letters that are not in the word
      const wordLetters = new Set(wordText.split(''));
      const availableLetters = russianLetters.split('').filter(letter => !wordLetters.has(letter));
      const incorrectLetters = availableLetters
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Combine correct and incorrect letters, then shuffle
      const allOptions = [correctLetter, ...incorrectLetters]
        .sort(() => Math.random() - 0.5);
      
      res.json({
        letterOptions: allOptions,
        missingLetterIndex,
        correctLetter
      });
    } catch (error) {
      console.error("Error getting letter options:", error);
      res.status(500).json({ message: "Failed to get letter options" });
    }
  });

  // Get word with extra letter for extra letter game
  app.get("/api/words/:id/extra-letter", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      
      const wordText = word.word;
      const russianLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
      
      // Choose a random position to insert extra letter (not at the very beginning or end)
      const insertPosition = Math.floor(Math.random() * (wordText.length - 1)) + 1;
      
      // Generate a random letter that's not in the word
      const wordLetters = new Set(wordText.split(''));
      const availableLetters = russianLetters.split('').filter(letter => !wordLetters.has(letter));
      const extraLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
      
      // Insert the extra letter
      const wordArray = wordText.split('');
      wordArray.splice(insertPosition, 0, extraLetter);
      const wordWithExtraLetter = wordArray.join('');
      
      res.json({
        wordWithExtraLetter,
        extraLetterIndex: insertPosition,
        extraLetter
      });
    } catch (error) {
      console.error("Error getting extra letter word:", error);
      res.status(500).json({ message: "Failed to get extra letter word" });
    }
  });

  // Get letter options for spell word game
  app.get("/api/words/:id/spell-letters", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      
      const wordText = word.word;
      const russianLetters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
      
      // Get all letters from the word (including duplicates)
      const wordLetters = wordText.split('');
      
      // Calculate how many additional letters we need (total should be 10)
      const targetTotal = 10;
      const additionalLettersNeeded = targetTotal - wordLetters.length;
      
      // Generate random letters that are not in the word
      const uniqueWordLetters = new Set(wordLetters);
      const availableLetters = russianLetters.split('').filter(letter => !uniqueWordLetters.has(letter));
      const additionalLetters = availableLetters
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(0, additionalLettersNeeded));
      
      // Combine word letters with additional letters and shuffle
      const allLetters = [...wordLetters, ...additionalLetters]
        .sort(() => Math.random() - 0.5);
      
      res.json({
        availableLetters: allLetters
      });
    } catch (error) {
      console.error("Error getting spell letters:", error);
      res.status(500).json({ message: "Failed to get spell letters" });
    }
  });

  // Create game progress
  app.post("/api/game-progress", async (req, res) => {
    try {
      const validatedData = insertGameProgressSchema.parse(req.body);
      const progress = await storage.createGameProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game progress" });
    }
  });

  // Get game progress
  app.get("/api/game-progress/:id", async (req, res) => {
    try {
      const progress = await storage.getGameProgress(req.params.id);
      if (!progress) {
        return res.status(404).json({ message: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game progress" });
    }
  });

  // Update game progress
  app.patch("/api/game-progress/:id", async (req, res) => {
    try {
      const updates = req.body;
      const progress = await storage.updateGameProgress(req.params.id, updates);
      if (!progress) {
        return res.status(404).json({ message: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game progress" });
    }
  });

  // Get today's progress (correct answers count)
  app.get("/api/progress/today", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || 'default-session';
      const count = await storage.getTodayCorrectAnswersCount(sessionId);
      res.json({ correctAnswersToday: count });
    } catch (error) {
      console.error("Error getting today's progress:", error);
      res.status(500).json({ message: "Failed to get today's progress" });
    }
  });

  // Record user answer
  app.post("/api/answers", async (req, res) => {
    try {
      const validatedData = insertUserAnswerSchema.parse(req.body);
      const answer = await storage.recordAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      console.error("Error recording answer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record answer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
