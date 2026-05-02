import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../../context/NotesContext';
import { BlockEditor, Block, serializeBlocks } from '../../components/BlockEditor';
import { useTheme, ThemeColors } from '../../components/theme';
import { DEFAULT_FOLDER_ID } from '../../types';

function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 6); }
function now() {
  const d = new Date();
  return {
    date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
  };
}

function blocksToNoteData(blocks: Block[]) {
  const content = serializeBlocks(blocks);
  const allChecklistItems: { id: string; text: string; checked: boolean }[] = [];
  for (const b of blocks) {
    if (b.type === 'checklist' && b.items) allChecklistItems.push(...b.items);
  }
  return { content, checklist: allChecklistItems };
}

export default function CreateNoteScreen() {
  const { addNote, folders } = useNotes();
  const router = useRouter();
  const params = useLocalSearchParams<{ folderId?: string }>();
  const t = useTheme();
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([{ id: genId(), type: 'text', text: '' }]);
  const [folderId, setFolderId] = useState(params.folderId || DEFAULT_FOLDER_ID);

  const handleSave = async () => {
    const { content, checklist } = blocksToNoteData(blocks);
    if (!title.trim() && !content.trim() && checklist.length === 0) {
      Alert.alert('Пустая заметка', 'Добавьте заголовок или содержание');
      return;
    }
    const { date, time } = now();
    await addNote({ title: title.trim() || 'Без заголовка', content, checklist, folderId, date, time });
    router.back();
  };

  const addChecklistBlock = () => {
    setBlocks(prev => [...prev, { id: genId(), type: 'checklist', items: [{ id: genId(), text: '', checked: false }] }]);
  };

  const addTextBlock = () => {
    setBlocks(prev => [...prev, { id: genId(), type: 'text', text: '' }]);
  };

  const s = mkStyles(t);

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Stack.Screen options={{
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} style={s.headerSaveBtn}>
            <Ionicons name="checkmark" size={22} color="#000" />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={s.scrollContent}>
        <Text style={s.metaDate}>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>

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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  headerSaveBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: t.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  metaDate: { fontSize: 13, color: t.textMuted, textAlign: 'center', paddingTop: 12, paddingBottom: 8 },
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
