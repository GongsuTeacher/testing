export interface Word {
  id: string;
  english: string;
  phonetic: string;
  reading: string;
  korean: string;
  example: string; // For composition section
}

export interface UserData {
  uid: string;
  email: string | null;
  points: number;
  stars: number;
  lastLearnedDay: number;
  wrongWords: string[]; // List of word IDs
  dailyProgress: Record<string, boolean>; // day -> completed
}

export type QuizType = 'multiple' | 'writing' | 'matching' | 'composition';
