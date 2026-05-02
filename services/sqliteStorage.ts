import * as SQLite from 'expo-sqlite';
import { IStorageService, Note, NoteInput, Folder, FolderInput } from '../types';

export class SQLiteStorage implements IStorageService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('notes.db');
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT '📁',
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        checklist TEXT NOT NULL DEFAULT '[]',
        folder_id TEXT NOT NULL DEFAULT 'all',
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    // Migration: add new columns if they don't exist
    try {
      await this.db.execAsync(`ALTER TABLE notes ADD COLUMN checklist TEXT NOT NULL DEFAULT '[]'`);
    } catch {}
    try {
      await this.db.execAsync(`ALTER TABLE notes ADD COLUMN folder_id TEXT NOT NULL DEFAULT 'all'`);
    } catch {}
  }

  private getDb(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  private rowToNote(row: any): Note {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      checklist: JSON.parse(row.checklist || '[]'),
      folderId: row.folder_id || 'all',
      date: row.date,
      time: row.time,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private rowToFolder(row: any): Folder {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon || '📁',
      createdAt: row.created_at,
    };
  }

  // =================== NOTES ===================

  async getAll(): Promise<Note[]> {
    const rows = await this.getDb().getAllAsync('SELECT * FROM notes ORDER BY updated_at DESC');
    return (rows as any[]).map(this.rowToNote);
  }

  async getById(id: string): Promise<Note | null> {
    const row = await this.getDb().getFirstAsync('SELECT * FROM notes WHERE id = ?', [id]);
    return row ? this.rowToNote(row) : null;
  }

  async getByFolder(folderId: string): Promise<Note[]> {
    if (folderId === 'all') return this.getAll();
    const rows = await this.getDb().getAllAsync(
      'SELECT * FROM notes WHERE folder_id = ? ORDER BY updated_at DESC', [folderId]
    );
    return (rows as any[]).map(this.rowToNote);
  }

  async create(input: NoteInput): Promise<Note> {
    const now = Date.now();
    const id = this.generateId();
    const note: Note = { id, ...input, createdAt: now, updatedAt: now };
    await this.getDb().runAsync(
      'INSERT INTO notes (id, title, content, checklist, folder_id, date, time, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, note.title, note.content, JSON.stringify(note.checklist), note.folderId, note.date, note.time, now, now]
    );
    return note;
  }

  async update(id: string, data: Partial<NoteInput>): Promise<Note> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Note ${id} not found`);
    const updated: Note = { ...existing, ...data, updatedAt: Date.now() };
    await this.getDb().runAsync(
      'UPDATE notes SET title=?, content=?, checklist=?, folder_id=?, date=?, time=?, updated_at=? WHERE id=?',
      [updated.title, updated.content, JSON.stringify(updated.checklist), updated.folderId, updated.date, updated.time, updated.updatedAt, id]
    );
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.getDb().runAsync('DELETE FROM notes WHERE id = ?', [id]);
  }

  async search(query: string): Promise<Note[]> {
    const q = `%${query}%`;
    const rows = await this.getDb().getAllAsync(
      'SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? OR date LIKE ? ORDER BY updated_at DESC',
      [q, q, q]
    );
    return (rows as any[]).map(this.rowToNote);
  }

  // =================== FOLDERS ===================

  async getAllFolders(): Promise<Folder[]> {
    const rows = await this.getDb().getAllAsync('SELECT * FROM folders ORDER BY created_at ASC');
    return (rows as any[]).map(this.rowToFolder);
  }

  async createFolder(input: FolderInput): Promise<Folder> {
    const now = Date.now();
    const id = this.generateId();
    const folder: Folder = { id, ...input, createdAt: now };
    await this.getDb().runAsync(
      'INSERT INTO folders (id, name, icon, created_at) VALUES (?, ?, ?, ?)',
      [id, folder.name, folder.icon, now]
    );
    return folder;
  }

  async updateFolder(id: string, data: Partial<FolderInput>): Promise<Folder> {
    const rows = await this.getDb().getAllAsync('SELECT * FROM folders WHERE id = ?', [id]);
    const existing = (rows as any[])[0];
    if (!existing) throw new Error(`Folder ${id} not found`);
    const updated = this.rowToFolder({ ...existing, ...data });
    await this.getDb().runAsync(
      'UPDATE folders SET name=?, icon=? WHERE id=?',
      [updated.name, updated.icon, id]
    );
    return updated;
  }

  async removeFolder(id: string): Promise<void> {
    // Move notes from deleted folder to "all"
    await this.getDb().runAsync('UPDATE notes SET folder_id = ? WHERE folder_id = ?', ['all', id]);
    await this.getDb().runAsync('DELETE FROM folders WHERE id = ?', [id]);
  }

  async getNoteCountByFolder(folderId: string): Promise<number> {
    if (folderId === 'all') {
      const row = await this.getDb().getFirstAsync('SELECT COUNT(*) as count FROM notes') as any;
      return row?.count || 0;
    }
    const row = await this.getDb().getFirstAsync(
      'SELECT COUNT(*) as count FROM notes WHERE folder_id = ?', [folderId]
    ) as any;
    return row?.count || 0;
  }
}
