import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../context/NotesContext';
import { StorageType } from '../types';
import { useTheme, ThemeColors } from '../components/theme';

export default function SettingsScreen() {
  const { storageType, switchStorage, notes, folders } = useNotes();
  const t = useTheme();

  const handleSwitch = (type: StorageType) => {
    if (type === storageType) return;
    Alert.alert('Сменить хранилище',
      `Переключить на ${type === 'sqlite' ? 'SQLite' : 'файловую систему'}?\n\nЗаметки не переносятся между хранилищами.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Переключить', onPress: () => switchStorage(type) },
      ]
    );
  };

  const s = mkStyles(t);

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Хранилище данных</Text>

      <View style={s.optionsGroup}>
        <TouchableOpacity
          style={s.option}
          onPress={() => handleSwitch('sqlite')}
        >
          <View style={[s.optionIcon, { backgroundColor: storageType === 'sqlite' ? t.accent : t.textLight }]}>
            <Ionicons name="server" size={18} color={storageType === 'sqlite' ? '#000' : '#FFF'} />
          </View>
          <View style={s.optionTextWrap}>
            <Text style={[s.optionTitle, storageType === 'sqlite' && { color: t.accent }]}>SQLite</Text>
            <Text style={s.optionDesc}>Быстрая база данных</Text>
          </View>
          {storageType === 'sqlite' && <Ionicons name="checkmark-circle" size={22} color={t.accent} />}
        </TouchableOpacity>

        <View style={s.optionSeparator} />

        <TouchableOpacity
          style={s.option}
          onPress={() => handleSwitch('filesystem')}
        >
          <View style={[s.optionIcon, { backgroundColor: storageType === 'filesystem' ? t.accent : t.textLight }]}>
            <Ionicons name="folder-open" size={18} color={storageType === 'filesystem' ? '#000' : '#FFF'} />
          </View>
          <View style={s.optionTextWrap}>
            <Text style={[s.optionTitle, storageType === 'filesystem' && { color: t.accent }]}>Файловая система</Text>
            <Text style={s.optionDesc}>Каждая заметка — отдельный файл</Text>
          </View>
          {storageType === 'filesystem' && <Ionicons name="checkmark-circle" size={22} color={t.accent} />}
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Информация</Text>

      <View style={s.statsGroup}>
        <View style={s.statsRow}>
          <View style={[s.statsIcon, { backgroundColor: t.accent }]}>
            <Ionicons name="document-text" size={16} color="#000" />
          </View>
          <Text style={s.statsLabel}>Заметок</Text>
          <Text style={s.statsValue}>{notes.length}</Text>
        </View>
        <View style={s.statsSeparator} />
        <View style={s.statsRow}>
          <View style={[s.statsIcon, { backgroundColor: t.folderYellow }]}>
            <Ionicons name="folder" size={16} color="#000" />
          </View>
          <Text style={s.statsLabel}>Папок</Text>
          <Text style={s.statsValue}>{folders.length}</Text>
        </View>
        <View style={s.statsSeparator} />
        <View style={s.statsRow}>
          <View style={[s.statsIcon, { backgroundColor: '#30D158' }]}>
            <Ionicons name="hardware-chip" size={16} color="#000" />
          </View>
          <Text style={s.statsLabel}>Хранилище</Text>
          <Text style={s.statsValue}>{storageType === 'sqlite' ? 'SQLite' : 'Файлы'}</Text>
        </View>
      </View>

      <Text style={s.footerText}>Деловые Заметки v1.0.0</Text>
    </View>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.background, paddingTop: 8 },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: t.sectionHeaderText,
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 32, paddingTop: 20, paddingBottom: 8,
  },
  optionsGroup: {
    backgroundColor: t.groupedCardBg, marginHorizontal: 16, borderRadius: 10, overflow: 'hidden',
  },
  option: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
  },
  optionIcon: {
    width: 30, height: 30, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontSize: 16, color: t.textDark, fontWeight: '400' },
  optionDesc: { fontSize: 12, color: t.textMuted, marginTop: 1 },
  optionSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: t.separator, marginLeft: 56 },
  statsGroup: {
    backgroundColor: t.groupedCardBg, marginHorizontal: 16, borderRadius: 10, overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
  },
  statsIcon: {
    width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  statsLabel: { flex: 1, fontSize: 16, color: t.textDark },
  statsValue: { fontSize: 16, color: t.textMuted },
  statsSeparator: { height: StyleSheet.hairlineWidth, backgroundColor: t.separator, marginLeft: 56 },
  footerText: { textAlign: 'center', fontSize: 12, color: t.textLight, marginTop: 32 },
});
