import { type Word, type InsertWord, type GameProgress, type InsertGameProgress } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Word management
  getAllWords(): Promise<Word[]>;
  getWord(id: string): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;
  
  // Game progress management
  getGameProgress(id: string): Promise<GameProgress | undefined>;
  createGameProgress(progress: InsertGameProgress): Promise<GameProgress>;
  updateGameProgress(id: string, progress: Partial<GameProgress>): Promise<GameProgress | undefined>;
  
  // Game logic helpers
  getRandomWords(excludeId: string, count: number): Promise<Word[]>;
}

export class MemStorage implements IStorage {
  private words: Map<string, Word>;
  private gameProgress: Map<string, GameProgress>;

  constructor() {
    this.words = new Map();
    this.gameProgress = new Map();
    this.initializeWords();
  }

  private async initializeWords() {
    const initialWords: InsertWord[] = [
      { word: "СЛОН", image: "elephant", audio: "slon.mp3" },
      { word: "КОТ", image: "cat", audio: "kot.mp3" },
      { word: "ДОМ", image: "house", audio: "dom.mp3" },
      { word: "МЯЧ", image: "ball", audio: "myach.mp3" },
      { word: "ЛИСА", image: "fox", audio: "lisa.mp3" },
      { word: "СТОЛ", image: "table", audio: "stol.mp3" },
      { word: "РЫБА", image: "fish", audio: "ryba.mp3" },
      { word: "СОБАКА", image: "dog", audio: "sobaka.mp3" },
      { word: "ЦВЕТОК", image: "flower", audio: "tsvetok.mp3" },
      { word: "МАШИНА", image: "car", audio: "mashina.mp3" }
    ];

    for (const wordData of initialWords) {
      await this.createWord(wordData);
    }
  }

  async getAllWords(): Promise<Word[]> {
    return Array.from(this.words.values());
  }

  async getWord(id: string): Promise<Word | undefined> {
    return this.words.get(id);
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const id = randomUUID();
    const word: Word = { ...insertWord, id };
    this.words.set(id, word);
    return word;
  }

  async getGameProgress(id: string): Promise<GameProgress | undefined> {
    return this.gameProgress.get(id);
  }

  async createGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    const id = randomUUID();
    const progress: GameProgress = { ...insertProgress, id };
    this.gameProgress.set(id, progress);
    return progress;
  }

  async updateGameProgress(id: string, updates: Partial<GameProgress>): Promise<GameProgress | undefined> {
    const existing = this.gameProgress.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.gameProgress.set(id, updated);
    return updated;
  }

  async getRandomWords(excludeId: string, count: number): Promise<Word[]> {
    const allWords = Array.from(this.words.values()).filter(w => w.id !== excludeId);
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

export const storage = new MemStorage();
