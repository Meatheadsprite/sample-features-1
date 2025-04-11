import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry, StorageKeys } from '../types';

// Validator function for entries
const validateEntry = (entry: any): entry is TravelEntry => {
  if (!entry || typeof entry !== 'object') return false;
  
  // Required fields validation
  const requiredFields = [
    { name: 'id', type: 'string' },
    { name: 'imageUri', type: 'string' },
    { name: 'address', type: 'string' },
    { name: 'latitude', type: 'number' },
    { name: 'longitude', type: 'number' },
    { name: 'createdAt', type: 'number' },
  ];
  
  for (const field of requiredFields) {
    if (typeof entry[field.name] !== field.type) {
      console.warn(`Entry validation failed: ${field.name} should be ${field.type} but got ${typeof entry[field.name]}`);
      return false;
    }
  }
  
  // Validate optional fields if present
  if (entry.title !== undefined && typeof entry.title !== 'string') return false;
  if (entry.notes !== undefined && typeof entry.notes !== 'string') return false;
  if (entry.tags !== undefined && !Array.isArray(entry.tags)) return false;
  if (entry.weather !== undefined && typeof entry.weather !== 'object') return false;
  
  return true;
};

// Helper function to validate entries array
const validateEntries = (entries: any): entries is TravelEntry[] => {
  if (!Array.isArray(entries)) {
    console.warn('Storage data is not an array');
    return false;
  }
  return entries.every(entry => validateEntry(entry));
};

/**
 * Save a new travel entry
 */
export const saveEntry = async (entry: TravelEntry): Promise<boolean> => {
  try {
    if (!validateEntry(entry)) {
      throw new Error('Invalid entry data structure');
    }
    
    // Get existing entries with validation
    const existingEntries = await getEntries();
    
    // Check for duplicate ID
    if (existingEntries.some(e => e.id === entry.id)) {
      console.warn('Duplicate entry ID detected, generating new ID');
      entry.id = `entry_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add new entry
    const updatedEntries = [...existingEntries, entry];
    
    // Save back to storage
    await AsyncStorage.setItem(StorageKeys.ENTRIES, JSON.stringify(updatedEntries));
    
    // Verify the save
    const currentEntries = await getEntries();
    const wasSaved = currentEntries.some(e => e.id === entry.id);
    
    if (!wasSaved) {
      console.error('Entry save verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving entry:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

/**
 * Get all travel entries
 */
export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const entriesString = await AsyncStorage.getItem(StorageKeys.ENTRIES);
    if (!entriesString) return [];
    
    const parsedData = JSON.parse(entriesString);
    
    if (!validateEntries(parsedData)) {
      console.error('Invalid entries format in storage, returning empty array');
      return [];
    }
    
    // Sort by creation date (newest first)
    return parsedData.sort((a: TravelEntry, b: TravelEntry) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting entries:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};

/**
 * Get a single entry by ID
 */
export const getEntryById = async (id: string): Promise<TravelEntry | null> => {
  try {
    const entries = await getEntries();
    const entry = entries.find(e => e.id === id);
    return entry || null;
  } catch (error) {
    console.error('Error getting entry by ID:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

/**
 * Remove a travel entry
 */
export const removeEntry = async (id: string): Promise<boolean> => {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid entry ID');
    }
    
    const existingEntries = await getEntries();
    const entryExists = existingEntries.some(entry => entry.id === id);
    
    if (!entryExists) {
      console.warn('Entry not found for deletion');
      return false;
    }
    
    const updatedEntries = existingEntries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(StorageKeys.ENTRIES, JSON.stringify(updatedEntries));
    
    // Verify the deletion
    const currentEntries = await getEntries();
    const wasRemoved = !currentEntries.some(entry => entry.id === id);
    
    if (!wasRemoved) {
      console.error('Deletion verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing entry:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

/**
 * Update an existing entry
 */
export const updateEntry = async (updatedEntry: TravelEntry): Promise<boolean> => {
  try {
    if (!validateEntry(updatedEntry)) {
      throw new Error('Invalid entry data structure');
    }
    
    const existingEntries = await getEntries();
    const entryIndex = existingEntries.findIndex(e => e.id === updatedEntry.id);
    
    if (entryIndex === -1) {
      console.warn('Entry not found for update');
      return false;
    }
    
    existingEntries[entryIndex] = updatedEntry;
    await AsyncStorage.setItem(StorageKeys.ENTRIES, JSON.stringify(existingEntries));
    
    // Verify the update
    const currentEntries = await getEntries();
    const updatedInStorage = currentEntries.some(e => 
      e.id === updatedEntry.id && e.createdAt === updatedEntry.createdAt
    );
    
    if (!updatedInStorage) {
      console.error('Update verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating entry:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

/**
 * Clear all travel entries
 */
export const clearAllEntries = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(StorageKeys.ENTRIES);
    
    // Verify the clear
    const currentEntries = await getEntries();
    if (currentEntries.length > 0) {
      console.error('Clear verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing entries:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

/**
 * Get the entry count
 */
export const getEntryCount = async (): Promise<number> => {
  try {
    const entries = await getEntries();
    return entries.length;
  } catch (error) {
    console.error('Error getting entry count:', error instanceof Error ? error.message : 'Unknown error');
    return 0;
  }
};

/**
 * Debug storage for development purposes
 */
export const debugStorage = async (): Promise<void> => {
  try {
    const entries = await getEntries();
    console.log('==== Storage Debug Info ====');
    console.log(`Total entries: ${entries.length}`);
    console.log(`Storage size: ${JSON.stringify(entries).length} bytes`);
    if (entries.length > 0) {
      console.log('Sample entry:', entries[0]);
    }
    console.log('============================');
  } catch (error) {
    console.error('Storage debug error:', error);
  }
};