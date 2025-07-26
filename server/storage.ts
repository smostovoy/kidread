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
