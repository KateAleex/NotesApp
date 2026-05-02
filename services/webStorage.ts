import { IStorageService, Note, NoteInput, Folder, FolderInput } from '../types';

const NOTES_KEY = 'notes_data';
const FOLDERS_KEY = 'folders_data';

export class WebStorage implements IStorageService {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  private getNotes(): Note[] {
    try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { return []; }
  }
  private saveNotes(notes: Note[]): void { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }
  private getFolders(): Folder[] {
    try { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]'); } catch { return []; }
  }
  private saveFolders(folders: Folder[]): void { localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)); }

  async init(): Promise<void> {}

  // =================== NOTES ===================

  async getAll(): Promise<Note[]> {
    return this.getNotes().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getById(id: string): Promise<Note | null> {
    return this.getNotes().find(n => n.id === id) || null;
  }

  async getByFolder(folderId: string): Promise<Note[]> {
    const notes = this.getNotes();
    const filtered = folderId === 'all' ? notes : notes.filter(n => n.folderId === folderId);
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async create(input: NoteInput): Promise<Note> {
    const now = Date.now();
    const note: Note = { id: this.generateId(), ...input, createdAt: now, updatedAt: now };
    const notes = this.getNotes();
    notes.push(note);
    this.saveNotes(notes);
    return note;
  }

  async update(id: string, data: Partial<NoteInput>): Promise<Note> {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) throw new Error(`Note ${id} not found`);
    notes[idx] = { ...notes[idx], ...data, updatedAt: Date.now() };
    this.saveNotes(notes);
    return notes[idx];
  }

  async remove(id: string): Promise<void> {
    this.saveNotes(this.getNotes().filter(n => n.id !== id));
  }

  async search(query: string): Promise<Note[]> {
    const q = query.toLowerCase();
    return this.getNotes()
      .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.date.includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // =================== FOLDERS ===================

  async getAllFolders(): Promise<Folder[]> {
    return this.getFolders().sort((a, b) => a.createdAt - b.createdAt);
  }

  async createFolder(input: FolderInput): Promise<Folder> {
    const folder: Folder = { id: this.generateId(), ...input, createdAt: Date.now() };
    const folders = this.getFolders();
    folders.push(folder);
    this.saveFolders(folders);
    return folder;
  }

  async updateFolder(id: string, data: Partial<FolderInput>): Promise<Folder> {
    const folders = this.getFolders();
    const idx = folders.findIndex(f => f.id === id);
    if (idx === -1) throw new Error(`Folder ${id} not found`);
    folders[idx] = { ...folders[idx], ...data };
    this.saveFolders(folders);
    return folders[idx];
  }

  async removeFolder(id: string): Promise<void> {
    // Move notes to "all"
    const notes = this.getNotes().map(n => n.folderId === id ? { ...n, folderId: 'all' } : n);
    this.saveNotes(notes);
    this.saveFolders(this.getFolders().filter(f => f.id !== id));
  }

  async getNoteCountByFolder(folderId: string): Promise<number> {
    const notes = this.getNotes();
    return folderId === 'all' ? notes.length : notes.filter(n => n.folderId === folderId).length;
  }
}
