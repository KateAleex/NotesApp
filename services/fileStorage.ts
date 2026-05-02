import { File, Directory, Paths } from 'expo-file-system';
import { IStorageService, Note, NoteInput, Folder, FolderInput } from '../types';

export class FileStorage implements IStorageService {
  private notesDir: Directory;
  private foldersFile: File;

  constructor() {
    this.notesDir = new Directory(Paths.document, 'notes');
    this.foldersFile = new File(Paths.document, 'folders.json');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  private noteFile(id: string): File { return new File(this.notesDir, `note_${id}.json`); }

  async init(): Promise<void> {
    if (!this.notesDir.exists) this.notesDir.create();
    if (!this.foldersFile.exists) {
      this.foldersFile.create();
      this.foldersFile.write('[]');
    }
  }

  // =================== NOTES ===================

  async getAll(): Promise<Note[]> {
    const entries = this.notesDir.list();
    const notes: Note[] = [];
    for (const entry of entries) {
      if (entry instanceof File && entry.name.endsWith('.json')) {
        try {
          const raw = await entry.text();
          const note = JSON.parse(raw);
          notes.push({ checklist: [], folderId: 'all', ...note });
        } catch {}
      }
    }
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getById(id: string): Promise<Note | null> {
    const file = this.noteFile(id);
    if (!file.exists) return null;
    try {
      const raw = await file.text();
      const note = JSON.parse(raw);
      return { checklist: [], folderId: 'all', ...note };
    } catch { return null; }
  }

  async getByFolder(folderId: string): Promise<Note[]> {
    const all = await this.getAll();
    return folderId === 'all' ? all : all.filter(n => n.folderId === folderId);
  }

  async create(input: NoteInput): Promise<Note> {
    const now = Date.now();
    const id = this.generateId();
    const note: Note = { id, ...input, createdAt: now, updatedAt: now };
    const file = this.noteFile(id);
    file.create();
    file.write(JSON.stringify(note, null, 2));
    return note;
  }

  async update(id: string, data: Partial<NoteInput>): Promise<Note> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Note ${id} not found`);
    const updated: Note = { ...existing, ...data, updatedAt: Date.now() };
    this.noteFile(id).write(JSON.stringify(updated, null, 2));
    return updated;
  }

  async remove(id: string): Promise<void> {
    const file = this.noteFile(id);
    if (file.exists) file.delete();
  }

  async search(query: string): Promise<Note[]> {
    const q = query.toLowerCase();
    return (await this.getAll()).filter(n =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.date.includes(q)
    );
  }

  // =================== FOLDERS ===================

  private readFolders(): Folder[] {
    try { return JSON.parse(this.foldersFile.textSync()); } catch { return []; }
  }

  async getAllFolders(): Promise<Folder[]> {
    return this.readFolders().sort((a, b) => a.createdAt - b.createdAt);
  }

  async createFolder(input: FolderInput): Promise<Folder> {
    const folder: Folder = { id: this.generateId(), ...input, createdAt: Date.now() };
    const folders = this.readFolders();
    folders.push(folder);
    this.foldersFile.write(JSON.stringify(folders, null, 2));
    return folder;
  }

  async updateFolder(id: string, data: Partial<FolderInput>): Promise<Folder> {
    const folders = this.readFolders();
    const idx = folders.findIndex(f => f.id === id);
    if (idx === -1) throw new Error(`Folder ${id} not found`);
    folders[idx] = { ...folders[idx], ...data };
    this.foldersFile.write(JSON.stringify(folders, null, 2));
    return folders[idx];
  }

  async removeFolder(id: string): Promise<void> {
    // Move notes to "all"
    const all = await this.getAll();
    for (const n of all) {
      if (n.folderId === id) await this.update(n.id, { folderId: 'all' });
    }
    this.foldersFile.write(JSON.stringify(this.readFolders().filter(f => f.id !== id), null, 2));
  }

  async getNoteCountByFolder(folderId: string): Promise<number> {
    return (await this.getByFolder(folderId)).length;
  }
}
