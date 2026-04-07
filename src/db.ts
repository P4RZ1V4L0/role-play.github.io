import Dexie, { type Table } from 'dexie';

export interface Character {
  id?: number;
  name: string;
  description: string;
  icon?: string; // Base64 or URL
  isAI: boolean;
  systemPrompt?: string;
}

export interface Message {
  id?: number;
  characterId: number;
  text: string;
  timestamp: number;
  role: 'user' | 'assistant' | 'system';
  image?: string;
  isSuperNsfw?: boolean;
}

export class RoleplayDB extends Dexie {
  characters!: Table<Character>;
  messages!: Table<Message>;

  constructor() {
    super('RoleplayDB');
    this.version(1).stores({
      characters: '++id, name, isAI',
      messages: '++id, characterId, timestamp'
    });
  }
}

export const db = new RoleplayDB();
