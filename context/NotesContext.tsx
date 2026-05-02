import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, NoteInput, Folder, FolderInput, StorageType, IStorageService } from '../types';
import { createStorage } from '../services/storage';

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  storageType: StorageType;
  isLoading: boolean;
  // Notes
  addNote: (input: NoteInput) => Promise<Note>;
  updateNote: (id: string, data: Partial<NoteInput>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  getNoteById: (id: string) => Promise<Note | null>;
  loadNotesByFolder: (folderId: string) => Promise<void>;
  getNoteCountByFolder: (folderId: string) => Promise<number>;
  // Folders
  addFolder: (input: FolderInput) => Promise<Folder>;
  updateFolder: (id: string, data: Partial<FolderInput>) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  refreshFolders: () => Promise<void>;
  // Storage
  switchStorage: (type: StorageType) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);
const STORAGE_KEY = 'notes_storage_type';

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [storageType, setStorageType] = useState<StorageType>('sqlite');
  const [storage, setStorage] = useState<IStorageService | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const type: StorageType = (saved as StorageType) || 'sqlite';
        setStorageType(type);
        const svc = await createStorage(type);
        await svc.init();
        setStorage(svc);
        setNotes(await svc.getAll());
        setFolders(await svc.getAllFolders());
      } catch (err) {
        console.error('Failed to initialize storage:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // =================== NOTES ===================

  const addNote = useCallback(async (input: NoteInput): Promise<Note> => {
    if (!storage) throw new Error('Storage not initialized');
    const note = await storage.create(input);
    setNotes(await storage.getAll());
    return note;
  }, [storage]);

  const updateNote = useCallback(async (id: string, data: Partial<NoteInput>) => {
    if (!storage) return;
    await storage.update(id, data);
    setNotes(await storage.getAll());
  }, [storage]);

  const removeNote = useCallback(async (id: string) => {
    if (!storage) return;
    await storage.remove(id);
    setNotes(await storage.getAll());
  }, [storage]);

  const searchNotes = useCallback(async (query: string) => {
    if (!storage) return;
    setNotes(query.trim() ? await storage.search(query) : await storage.getAll());
  }, [storage]);

  const clearSearch = useCallback(async () => {
    if (!storage) return;
    setNotes(await storage.getAll());
  }, [storage]);

  const getNoteById = useCallback(async (id: string): Promise<Note | null> => {
    if (!storage) return null;
    return storage.getById(id);
  }, [storage]);

  const loadNotesByFolder = useCallback(async (folderId: string) => {
    if (!storage) return;
    setNotes(await storage.getByFolder(folderId));
  }, [storage]);

  const getNoteCountByFolder = useCallback(async (folderId: string): Promise<number> => {
    if (!storage) return 0;
    return storage.getNoteCountByFolder(folderId);
  }, [storage]);

  // =================== FOLDERS ===================

  const addFolder = useCallback(async (input: FolderInput): Promise<Folder> => {
    if (!storage) throw new Error('Storage not initialized');
    const folder = await storage.createFolder(input);
    setFolders(await storage.getAllFolders());
    return folder;
  }, [storage]);

  const updateFolder = useCallback(async (id: string, data: Partial<FolderInput>) => {
    if (!storage) return;
    await storage.updateFolder(id, data);
    setFolders(await storage.getAllFolders());
  }, [storage]);

  const removeFolder = useCallback(async (id: string) => {
    if (!storage) return;
    await storage.removeFolder(id);
    setFolders(await storage.getAllFolders());
    setNotes(await storage.getAll());
  }, [storage]);

  const refreshFolders = useCallback(async () => {
    if (!storage) return;
    setFolders(await storage.getAllFolders());
  }, [storage]);

  // =================== STORAGE ===================

  const switchStorage = useCallback(async (type: StorageType) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, type);
      const svc = await createStorage(type);
      await svc.init();
      setStorage(svc);
      setStorageType(type);
      setNotes(await svc.getAll());
      setFolders(await svc.getAllFolders());
    } catch (err) {
      console.error('Failed to switch storage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <NotesContext.Provider value={{
      notes, folders, storageType, isLoading,
      addNote, updateNote, removeNote, searchNotes, clearSearch,
      getNoteById, loadNotesByFolder, getNoteCountByFolder,
      addFolder, updateFolder, removeFolder, refreshFolders,
      switchStorage,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextType {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
