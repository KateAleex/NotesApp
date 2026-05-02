import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../../context/NotesContext';
import { NoteCard } from '../../components/NoteCard';
import { SearchBar } from '../../components/SearchBar';
import { useTheme, ThemeColors } from '../../components/theme';
import { Note } from '../../types';

function groupNotesByDate(notes: Note[]): { title: string; data: Note[] }[] {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const groups: Record<string, Note[]> = {};
  const order: string[] = [];

  for (const note of notes) {
    let key: string;
    if (note.date === todayStr) key = 'Сегодня';
    else if (note.date === yesterdayStr) key = 'Вчера';
    else key = note.date.split('-')[0];

    if (!groups[key]) { groups[key] = []; order.push(key); }
    groups[key].push(note);
  }

  return order.map(title => ({ title, data: groups[title] }));
}

export default function FolderNotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, isLoading, removeNote, loadNotesByFolder, searchNotes, folders } = useNotes();
  const router = useRouter();
  const t = useTheme();
  const folderName = id === 'all' ? 'Все заметки' : folders.find(f => f.id === id)?.name || 'Заметки';

  useFocusEffect(useCallback(() => { if (id) loadNotesByFolder(id); }, [id, loadNotesByFolder]));

  const handleNotePress = useCallback((note: Note) => { router.push(`/note/${note.id}`); }, [router]);
  const handleDelete = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    Alert.alert('Удалить заметку', `Удалить "${note?.title || 'Без заголовка'}"?`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await removeNote(noteId); if (id) loadNotesByFolder(id); } },
    ]);
  }, [notes, removeNote, id, loadNotesByFolder]);

  const sections = useMemo(() => groupNotesByDate(notes), [notes]);
  const s = mkStyles(t);

  if (isLoading) return <View style={s.centered}><ActivityIndicator size="large" color={t.accent} /></View>;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={t.accent} />
          <Text style={s.backText}>Папки</Text>
        </TouchableOpacity>
      </View>
      <View style={s.titleRow}>
        <Text style={s.largeTitle}>{folderName}</Text>
      </View>

      {notes.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="document-text-outline" size={56} color={t.textLight} />
          <Text style={s.emptyTitle}>Нет заметок</Text>
          <Text style={s.emptySubtitle}>Создайте заметку, нажав на кнопку ниже</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          <SearchBar onSearch={async (q) => { await searchNotes(q); }} onClear={async () => { if (id) await loadNotesByFolder(id); }} />

          {sections.map((section) => (
            <View key={section.title} style={s.sectionWrap}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <View style={s.sectionCard}>
                {section.data.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && <View style={s.cardSeparator} />}
                    <NoteCard note={item} onPress={handleNotePress} onDelete={handleDelete} />
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => router.push({ pathname: '/note/create', params: { folderId: id } })}>
          <Ionicons name="create-outline" size={24} color={t.accent} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.background },

  header: { paddingHorizontal: 8, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 17, color: t.accent, marginLeft: -2 },
  titleRow: { paddingHorizontal: 16, paddingBottom: 8 },
  largeTitle: { fontSize: 34, fontWeight: '700', color: t.textDark },

  list: { paddingBottom: 90 },
  sectionWrap: { marginBottom: 4 },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: t.textDark,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  sectionCard: {
    backgroundColor: t.groupedCardBg, marginHorizontal: 16,
    borderRadius: 10, overflow: 'hidden',
  },
  cardSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: t.separator, marginLeft: 16 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: t.textMuted, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: t.textLight, marginTop: 6 },

  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 4 : 14,
    backgroundColor: t.toolbarBg,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.separator,
  },
});
