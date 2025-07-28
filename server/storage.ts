import { type Word, type InsertWord, type GameProgress, type InsertGameProgress, type UserAnswer, type InsertUserAnswer, words, userAnswers } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, sql, notInArray } from "drizzle-orm";
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
  
  // User answer tracking
  recordAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getCorrectAnswersInLastMonth(sessionId: string): Promise<string[]>;
  getTodayCorrectAnswersCount(sessionId: string): Promise<number>;
  
  // Game logic helpers
  getRandomWords(excludeId: string, count: number): Promise<Word[]>;
  getAvailableWords(sessionId: string): Promise<Word[]>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    
    await this.initializeWords();
    this.initialized = true;
  }

  private async initializeWords() {
    // Check if words already exist
    const existingWords = await db.select().from(words).limit(1);
    if (existingWords.length > 0) return;

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
      { word: "МАШИНА", image: "car", audio: "mashina.mp3" },
      { word: "ДЕРЕВО", image: "tree", audio: "derevo.mp3" },
      { word: "СОЛНЦЕ", image: "sun", audio: "solntse.mp3" },
      { word: "ЛУНА", image: "moon", audio: "luna.mp3" },
      { word: "ЗВЕЗДА", image: "star", audio: "zvezda.mp3" },
      { word: "ОБЛАКО", image: "cloud", audio: "oblako.mp3" },
      { word: "ПТИЦА", image: "bird", audio: "ptitsa.mp3" },
      { word: "ХЛЕБ", image: "bread", audio: "hleb.mp3" },
      { word: "МОЛОКО", image: "milk", audio: "moloko.mp3" },
      { word: "ЯБЛОКО", image: "apple", audio: "yabloko.mp3" },
      { word: "КНИГА", image: "book", audio: "kniga.mp3" },
      { word: "КАРАНДАШ", image: "pencil", audio: "karandash.mp3" },
      { word: "СТУЛ", image: "chair", audio: "stul.mp3" },
      { word: "ОКНО", image: "window", audio: "okno.mp3" },
      { word: "ДВЕРЬ", image: "door", audio: "dver.mp3" },
      { word: "ЛАМПА", image: "lamp", audio: "lampa.mp3" },
      { word: "ЧАСЫ", image: "clock", audio: "chasy.mp3" },
      { word: "ТЕЛЕФОН", image: "phone", audio: "telefon.mp3" },
      { word: "ТЕЛЕВИЗОР", image: "tv", audio: "televizor.mp3" },
      { word: "КОМПЬЮТЕР", image: "computer", audio: "kompyuter.mp3" },
      { word: "САМОЛЕТ", image: "airplane", audio: "samolet.mp3" },
      { word: "ПОЕЗД", image: "train", audio: "poezd.mp3" },
      { word: "АВТОБУС", image: "bus", audio: "avtobus.mp3" },
      { word: "ВЕЛОСИПЕД", image: "bicycle", audio: "velosiped.mp3" },
      { word: "КОРАБЛЬ", image: "ship", audio: "korabl.mp3" },
      { word: "МЕДВЕДЬ", image: "bear", audio: "medved.mp3" },
      { word: "ЗАЯЦ", image: "rabbit", audio: "zayats.mp3" },
      { word: "ВОЛК", image: "wolf", audio: "volk.mp3" },
      { word: "ЛЯГУШКА", image: "frog", audio: "lyagushka.mp3" },
      { word: "БАБОЧКА", image: "butterfly", audio: "babochka.mp3" },
      { word: "ПЧЕЛА", image: "bee", audio: "pchela.mp3" }
    ];

    // Insert all words at once
    await db.insert(words).values(initialWords);
  }

  async getAllWords(): Promise<Word[]> {
    await this.ensureInitialized();
    return await db.select().from(words);
  }

  async getWord(id: string): Promise<Word | undefined> {
    await this.ensureInitialized();
    const [word] = await db.select().from(words).where(eq(words.id, id));
    return word || undefined;
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const [word] = await db.insert(words).values(insertWord).returning();
    return word;
  }

  async getGameProgress(id: string): Promise<GameProgress | undefined> {
    // Implementation for game progress (not changed)
    return undefined;
  }

  async createGameProgress(insertProgress: InsertGameProgress): Promise<GameProgress> {
    // Implementation for game progress (not changed)
    throw new Error("Not implemented");
  }

  async updateGameProgress(id: string, updates: Partial<GameProgress>): Promise<GameProgress | undefined> {
    // Implementation for game progress (not changed)
    return undefined;
  }

  async recordAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const [userAnswer] = await db.insert(userAnswers).values(answer).returning();
    return userAnswer;
  }

  async getCorrectAnswersInLastMonth(sessionId: string): Promise<string[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const correctAnswers = await db
      .select({ wordId: userAnswers.wordId })
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.sessionId, sessionId),
          eq(userAnswers.isCorrect, true),
          gt(userAnswers.answeredAt, oneMonthAgo)
        )
      );

    return correctAnswers.map(answer => answer.wordId);
  }

  async getTodayCorrectAnswersCount(sessionId: string): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.sessionId, sessionId),
          eq(userAnswers.isCorrect, true),
          gt(userAnswers.answeredAt, todayStart)
        )
      );

    return Number(result[0]?.count || 0);
  }

  async getAvailableWords(sessionId: string): Promise<Word[]> {
    await this.ensureInitialized();
    
    const correctWordIds = await this.getCorrectAnswersInLastMonth(sessionId);
    
    if (correctWordIds.length === 0) {
      return await this.getAllWords();
    }

    // Get words that haven't been answered correctly in the last month
    const availableWords = await db
      .select()
      .from(words)
      .where(notInArray(words.id, correctWordIds));

    return availableWords;
  }

  async getRandomWords(excludeId: string, count: number): Promise<Word[]> {
    await this.ensureInitialized();
    
    const allWords = await db
      .select()
      .from(words)
      .where(sql`${words.id} != ${excludeId}`)
      .orderBy(sql`RANDOM()`)
      .limit(count);

    return allWords;
  }
}

export const storage = new DatabaseStorage();
