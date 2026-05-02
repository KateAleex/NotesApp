import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';
import { useTheme, ThemeColors } from './theme';
import { getBlocksPreview, getBlocksChecklistStats } from './BlockEditor';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onDelete: (id: string) => void;
}

function formatNoteDate(dateStr: string, timeStr: string): string {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (dateStr === todayStr) {
    return timeStr;
  }

  const [, month, day] = dateStr.split('-');
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${parseInt(day)}.${parseInt(month)}.${dateStr.split('-')[0]}`;
}

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const t = useTheme();
  const preview = getBlocksPreview(note.content);
  const stats = getBlocksChecklistStats(note.content);
  const legacyChecklist = note.checklist || [];
  const hasChecklist = stats ? stats.total > 0 : legacyChecklist.length > 0;
  const checkedCount = stats ? stats.checked : legacyChecklist.filter(c => c.checked).length;
  const totalCount = stats ? stats.total : legacyChecklist.length;
  const s = mkStyles(t);

  return (
    <TouchableOpacity style={s.card} onPress={() => onPress(note)} onLongPress={() => onDelete(note.id)} activeOpacity={0.6}>
      <Text style={s.title} numberOfLines={1}>{note.title || 'Новая заметка'}</Text>
      <View style={s.metaRow}>
        <Text style={s.date}>{formatNoteDate(note.date, note.time)}</Text>
        {hasChecklist && (
          <View style={s.checklistBadge}>
            <Ionicons name={checkedCount === totalCount ? 'checkmark-circle' : 'ellipse-outline'} size={12} color={checkedCount === totalCount ? t.checkGreen : t.textMuted} />
            <Text style={s.checklistText}>{checkedCount}/{totalCount}</Text>
          </View>
        )}
        {preview ? <Text style={s.preview} numberOfLines={1}>{preview}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  card: { paddingVertical: 10, paddingHorizontal: 16 },
  title: { fontSize: 16, fontWeight: '600', color: t.textDark, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 14, color: t.textMuted },
  checklistBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  checklistText: { fontSize: 13, color: t.textMuted },
  preview: { fontSize: 14, color: t.textMuted, flex: 1 },
});
