import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../../context/NotesContext';
import { BlockEditor, Block, serializeBlocks, deserializeBlocks } from '../../components/BlockEditor';
import { useTheme, ThemeColors } from '../../components/theme';
import { Note } from '../../types';

function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 6); }

function noteToBlocks(note: Note): Block[] {
  return deserializeBlocks(note.content, note.checklist);
}

function blocksToNoteData(blocks: Block[]) {
  const content = serializeBlocks(blocks);
  const allItems: { id: string; text: string; checked: boolean }[] = [];
  for (const b of blocks) {
    if (b.type === 'checklist' && b.items) allItems.push(...b.items);
  }
  return { content, checklist: allItems };
}

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNoteById, updateNote, removeNote, folders } = useNotes();
  const router = useRouter();
  const t = useTheme();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [folderId, setFolderId] = useState('all');

  useEffect(() => {
    (async () => {
      if (id) {
        const found = await getNoteById(id);
        if (found) {
          setNote(found);
          setTitle(found.title);
          setBlocks(noteToBlocks(found));
          setFolderId(found.folderId);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const { content, checklist } = blocksToNoteData(blocks);
    await updateNote(id, { title: title.trim() || 'Без заголовка', content, checklist, folderId });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Удалить заметку', 'Эта заметка будет удалена безвозвратно.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { if (id) { await removeNote(id); router.back(); } } },
    ]);
  };

  const addChecklistBlock = () => {
    setBlocks(prev => [...prev, { id: genId(), type: 'checklist', items: [{ id: genId(), text: '', checked: false }] }]);
  };

  const addTextBlock = () => {
    setBlocks(prev => [...prev, { id: genId(), type: 'text', text: '' }]);
  };

  const s = mkStyles(t);
  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color={t.accent} /></View>;
  if (!note) return <View style={s.centered}><Text style={{ color: t.textMuted }}>Заметка не найдена</Text></View>;

  const dateStr = new Date(note.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Stack.Screen options={{
        headerRight: () => (
          <View style={s.headerRight}>
            <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
              <Ionicons name="ellipsis-horizontal-circle" size={24} color={t.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={s.headerSaveBtn}>
              <Ionicons name="checkmark" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        ),
      }} />

      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={s.scrollContent}>
        <Text style={s.dateLabel}>{dateStr}</Text>

        <View style={s.editorWrap}>
          <TextInput
            style={s.titleInput}
            placeholder="Заголовок"
            placeholderTextColor={t.textPlaceholder}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </View>
      </ScrollView>

      <View style={s.toolbar}>
        <TouchableOpacity onPress={() => {}} style={s.toolBtn}>
          <Text style={s.toolBtnText}>Aa</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={addChecklistBlock} style={s.toolBtn}>
          <Ionicons name="checkmark-circle-outline" size={22} color={t.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={s.toolBtn}>
          <Ionicons name="grid-outline" size={20} color={t.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={s.toolBtn}>
          <Ionicons name="attach" size={22} color={t.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={s.toolBtn}>
          <Ionicons name="camera-outline" size={22} color={t.textMuted} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={addTextBlock} style={s.toolBtn}>
          <Ionicons name="create-outline" size={22} color={t.accent} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerSaveBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: t.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  dateLabel: { fontSize: 13, color: t.textMuted, textAlign: 'center', paddingTop: 12, paddingBottom: 8 },
  editorWrap: { paddingHorizontal: 16 },
  titleInput: { fontSize: 28, fontWeight: '700', color: t.textDark, paddingVertical: 4, marginBottom: 8 },
  toolbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: t.toolbarBg,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.separator,
  },
  toolBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  toolBtnText: { fontSize: 18, fontWeight: '600', color: t.textMuted },
});
