import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal, Platform, SafeAreaView, KeyboardAvoidingView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../context/NotesContext';
import { useTheme, ThemeColors } from '../components/theme';
import { Folder } from '../types';

export default function FoldersScreen() {
  const { folders, isLoading, addFolder, removeFolder, updateFolder, getNoteCountByFolder } = useNotes();
  const router = useRouter();
  const t = useTheme();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editName, setEditName] = useState('');

  const loadCounts = useCallback(async () => {
    const allCount = await getNoteCountByFolder('all');
    const c: Record<string, number> = { all: allCount };
    for (const f of folders) { c[f.id] = await getNoteCountByFolder(f.id); }
    setCounts(c);
  }, [folders, getNoteCountByFolder]);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await addFolder({ name: newFolderName.trim(), icon: 'folder' });
    setNewFolderName(''); setShowNewFolder(false); loadCounts();
  };

  const handleFolderLongPress = (folder: Folder) => {
    Alert.alert(folder.name, 'Выберите действие', [
      { text: 'Переименовать', onPress: () => { setEditingFolder(folder); setEditName(folder.name); } },
      { text: 'Удалить', style: 'destructive', onPress: () => {
        Alert.alert('Удалить папку', 'Заметки будут перемещены в "Все заметки".', [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', style: 'destructive', onPress: () => removeFolder(folder.id) },
        ]);
      }},
      { text: 'Отмена', style: 'cancel' },
    ]);
  };

  const handleRename = async () => {
    if (!editingFolder || !editName.trim()) return;
    await updateFolder(editingFolder.id, { name: editName.trim() });
    setEditingFolder(null); setEditName('');
  };

  const s = mkStyles(t);

  if (isLoading) return <View style={s.centered}><ActivityIndicator size="large" color={t.accent} /></View>;

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={22} color={t.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNewFolder(true)}>
              <Text style={s.headerBtn}>Править</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.largeTitle}>Папки</Text>
        </View>

        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Folder list */}
          <View style={s.listContainer}>
            <TouchableOpacity style={s.folderRow} onPress={() => router.push('/folder/all')} activeOpacity={0.6}>
              <View style={[s.folderIconWrap, { backgroundColor: t.folderYellow }]}>
                <Ionicons name="documents" size={20} color="#FFF" />
              </View>
              <Text style={s.folderName}>Все заметки</Text>
              <Text style={s.folderCount}>{counts['all'] ?? 0}</Text>
              <Ionicons name="chevron-forward" size={18} color={t.textLight} />
            </TouchableOpacity>

            {folders.map((folder) => (
              <React.Fragment key={folder.id}>
                <View style={s.rowSeparator} />
                <TouchableOpacity style={s.folderRow} onPress={() => router.push(`/folder/${folder.id}`)} onLongPress={() => handleFolderLongPress(folder)} activeOpacity={0.6}>
                  <View style={[s.folderIconWrap, { backgroundColor: t.folderYellow }]}>
                    <Ionicons name="folder" size={20} color="#FFF" />
                  </View>
                  <Text style={s.folderName}>{folder.name}</Text>
                  <Text style={s.folderCount}>{counts[folder.id] ?? 0}</Text>
                  <Ionicons name="chevron-forward" size={18} color={t.textLight} />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>

          {/* Inline new folder input */}
          {showNewFolder && (
            <View style={s.newFolderContainer}>
              <View style={s.newFolderRow}>
                <Ionicons name="folder-outline" size={20} color={t.accent} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.newFolderInput}
                  placeholder="Название папки"
                  placeholderTextColor={t.textPlaceholder}
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  autoFocus
                  onSubmitEditing={handleCreateFolder}
                  selectionColor={t.accent}
                />
                <TouchableOpacity style={s.newFolderSave} onPress={handleCreateFolder}>
                  <Text style={s.newFolderSaveText}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowNewFolder(false); setNewFolderName(''); }} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={22} color={t.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom bar */}
        <View style={s.bottomBar}>
          <TouchableOpacity onPress={() => setShowNewFolder(true)}>
            <Ionicons name="folder-open-outline" size={24} color={t.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/note/create')}>
            <Ionicons name="create-outline" size={24} color={t.accent} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Rename modal */}
      <Modal visible={!!editingFolder} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Переименовать папку</Text>
            <TextInput style={s.modalInput} value={editName} onChangeText={setEditName} autoFocus onSubmitEditing={handleRename} selectionColor={t.accent} />
            <View style={s.modalButtons}>
              <TouchableOpacity style={s.modalBtnCancel} onPress={() => setEditingFolder(null)}>
                <Text style={s.modalBtnCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalBtnSave} onPress={handleRename}>
                <Text style={s.modalBtnSaveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.background },

  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  headerBtn: { fontSize: 17, color: t.accent },
  largeTitle: { fontSize: 34, fontWeight: '700', color: t.textDark, paddingTop: 4, paddingBottom: 12 },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  listContainer: { backgroundColor: t.groupedCardBg, borderRadius: 10, overflow: 'hidden' },
  folderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  rowSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: t.separator, marginLeft: 60 },
  folderIconWrap: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  folderName: { flex: 1, fontSize: 17, color: t.textDark },
  folderCount: { fontSize: 17, color: t.textMuted, marginRight: 8 },

  newFolderContainer: { marginTop: 12 },
  newFolderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: t.groupedCardBg, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 2, borderColor: t.accent,
  },
  newFolderInput: { flex: 1, fontSize: 16, color: t.textDark, paddingVertical: 4 },
  newFolderSave: { backgroundColor: t.accent, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  newFolderSaveText: { color: '#000', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: t.modalOverlay, justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: t.groupedCardBg, borderRadius: 14, padding: 24, width: 300 },
  modalTitle: { fontSize: 17, fontWeight: '600', color: t.textDark, textAlign: 'center', marginBottom: 16 },
  modalInput: { backgroundColor: t.inputBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: t.textDark, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtnCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: t.inputBg, alignItems: 'center' },
  modalBtnCancelText: { fontSize: 15, color: t.textMuted, fontWeight: '500' },
  modalBtnSave: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: t.accent, alignItems: 'center' },
  modalBtnSaveText: { fontSize: 15, color: '#000', fontWeight: '600' },

  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 4 : 14,
    backgroundColor: t.toolbarBg,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.separator,
  },
});
