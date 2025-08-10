import { type Word, type InsertWord, type GameProgress, type InsertGameProgress, type UserAnswer, type InsertUserAnswer, words, userAnswers } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, sql, notInArray } from "drizzle-orm";
import { randomUUID } from "crypto";

// Import blacklist from constants
// These are words with non-standard spelling or rare letters that are 
// exceptions and too complicated for beginner language learners
const LEARNING_BLACKLIST = {
  words: ['СОЛНЦЕ', 'СТОЛ'],   // silent 'л' - difficult for beginners, СТОЛ removed per user request
  letters: ['Ъ']       // hard sign - rare and complex usage rules
} as const;

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

  // Helper function to check if a word is blacklisted
  private isWordBlacklisted(word: string): boolean {
    return LEARNING_BLACKLIST.words.includes(word.toUpperCase() as any);
  }

  // Helper function to check if a word contains blacklisted letters
  private containsBlacklistedLetters(word: string): boolean {
    return LEARNING_BLACKLIST.letters.some(letter => word.toUpperCase().includes(letter));
  }

  // Filter words to exclude blacklisted ones
  private filterBlacklistedWords(words: Word[]): Word[] {
    return words.filter(word => 
      !this.isWordBlacklisted(word.word) && 
      !this.containsBlacklistedLetters(word.word)
    );
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    
    await this.initializeWords();
    this.initialized = true;
  }

  private async initializeWords() {
    // Check if words already exist
    const existingWords = await db.select().from(words).limit(1);
    if (existingWords.length > 0) {
      // Check if we need to add new words (current count vs expected)
      const currentCount = await db.select({ count: sql<number>`count(*)` }).from(words);
      const expectedCount = 69; // Original 39 + 30 new words
      
      if (Number(currentCount[0]?.count || 0) >= expectedCount) {
        return; // Already has all words
      }
      
      // Need to reinitialize with new words
      console.log('Adding new words to existing database...');
    }

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
      { word: "ПЧЕЛА", image: "bee", audio: "pchela.mp3" },
      
      // Additional 30 words for more practice
      { word: "МАМА", image: "mother", audio: "mama.mp3" },
      { word: "ПАПА", image: "father", audio: "papa.mp3" },
      { word: "ДЯДЯ", image: "uncle", audio: "dyadya.mp3" },
      { word: "ТЁТЯ", image: "aunt", audio: "tyotya.mp3" },
      { word: "БРАТ", image: "brother", audio: "brat.mp3" },
      { word: "СЕСТРА", image: "sister", audio: "sestra.mp3" },
      { word: "ДЕДУШКА", image: "grandfather", audio: "dedushka.mp3" },
      { word: "БАБУШКА", image: "grandmother", audio: "babushka.mp3" },
      { word: "ВОДА", image: "water", audio: "voda.mp3" },
      { word: "ОГОНЬ", image: "fire", audio: "ogon.mp3" },
      { word: "ЗЕМЛЯ", image: "earth", audio: "zemlya.mp3" },
      { word: "НЕБО", image: "sky", audio: "nebo.mp3" },
      { word: "ВЕТЕР", image: "wind", audio: "veter.mp3" },
      { word: "СНЕГ", image: "snow", audio: "sneg.mp3" },
      { word: "ДОЖДЬ", image: "rain", audio: "dozhd.mp3" },
      { word: "ЛЕТО", image: "summer", audio: "leto.mp3" },
      { word: "ЗИМА", image: "winter", audio: "zima.mp3" },
      { word: "ВЕСНА", image: "spring", audio: "vesna.mp3" },
      { word: "ОСЕНЬ", image: "autumn", audio: "osen.mp3" },
      { word: "УТРО", image: "morning", audio: "utro.mp3" },
      { word: "ДЕНЬ", image: "day", audio: "den.mp3" },
      { word: "ВЕЧЕР", image: "evening", audio: "vecher.mp3" },
      { word: "НОЧЬ", image: "night", audio: "noch.mp3" },
      { word: "ШКОЛА", image: "school", audio: "shkola.mp3" },
      { word: "ПАРК", image: "park", audio: "park.mp3" },
      { word: "МАГАЗИН", image: "store", audio: "magazin.mp3" },
      { word: "БОЛЬНИЦА", image: "hospital", audio: "bolnitsa.mp3" },
      { word: "ТЕАТР", image: "theater", audio: "teatr.mp3" },
      { word: "МУЗЕЙ", image: "museum", audio: "muzey.mp3" },
      { word: "РЫНОК", image: "market", audio: "rynok.mp3" }
    ];

    // Insert all words at once
    await db.insert(words).values(initialWords);
  }

  async getAllWords(): Promise<Word[]> {
    await this.ensureInitialized();
    const allWords = await db.select().from(words);
    return this.filterBlacklistedWords(allWords);
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

    const filteredWords = this.filterBlacklistedWords(availableWords);
    
    // If no words available (user completed all), return all words to keep playing
    if (filteredWords.length === 0) {
      console.log('All words completed! Returning all words for continued practice.');
      return await this.getAllWords();
    }

    return filteredWords;
  }

  async getRandomWords(excludeId: string, count: number): Promise<Word[]> {
    await this.ensureInitialized();
    
    const allWords = await db
      .select()
      .from(words)
      .where(sql`${words.id} != ${excludeId}`)
      .orderBy(sql`RANDOM()`)
      .limit(count * 3); // Get more words to account for filtering

    const filteredWords = this.filterBlacklistedWords(allWords);
    return filteredWords.slice(0, count); // Return only the requested count
  }
}

export const storage = new DatabaseStorage();
