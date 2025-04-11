// Enhanced travel entry type with optional fields for future expansion
export interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: number;
  // Optional fields for future features
  title?: string;
  notes?: string;
  tags?: string[];
  weather?: {
    temperature?: number;
    conditions?: string;
    humidity?: number;
  };
}

// Theme type
export type Theme = 'light' | 'dark';

// Permission status type
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

// Storage keys
export enum StorageKeys {
  ENTRIES = '@travel_diary_entries',
  THEME = '@travel_diary_theme',
  APP_OPENED_COUNT = '@travel_diary_opened_count',
  FIRST_LAUNCH = '@travel_diary_first_launch',
}