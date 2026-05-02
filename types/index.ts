export interface Folder {
  id: string;
  name: string;
  icon: string;        // emoji icon
  createdAt: number;
}

export type FolderInput = Omit<Folder, 'id' | 'createdAt'>;

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  checklist: ChecklistItem[];
  folderId: string;       // "all" = без папки
  date: string;           // YYYY-MM-DD
  time: string;           // HH:MM
  createdAt: number;
  updatedAt: number;
}

export type NoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

export type StorageType = 'sqlite' | 'filesystem';

export interface IStorageService {
  init(): Promise<void>;

  // Notes
  getAll(): Promise<Note[]>;
  getById(id: string): Promise<Note | null>;
  getByFolder(folderId: string): Promise<Note[]>;
  create(note: NoteInput): Promise<Note>;
  update(id: string, data: Partial<NoteInput>): Promise<Note>;
  remove(id: string): Promise<void>;
  search(query: string): Promise<Note[]>;

  // Folders
  getAllFolders(): Promise<Folder[]>;
  createFolder(input: FolderInput): Promise<Folder>;
  updateFolder(id: string, data: Partial<FolderInput>): Promise<Folder>;
  removeFolder(id: string): Promise<void>;
  getNoteCountByFolder(folderId: string): Promise<number>;
}

export const DEFAULT_FOLDER_ID = 'all';
