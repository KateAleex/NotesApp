import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistItem } from '../types';
import { useTheme } from './theme';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const t = useTheme();
  const toggleItem = (id: string) => onChange(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const updateText = (id: string, text: string) => onChange(items.map(i => i.id === id ? { ...i, text } : i));
  const removeItem = (id: string) => onChange(items.filter(i => i.id !== id));
  const addItem = () => onChange([...items, { id: generateId(), text: '', checked: false }]);

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <View style={s.container}>
      {items.length > 0 && (
        <View style={s.header}>
          <Ionicons name="checkmark-done" size={16} color={t.accent} />
          <Text style={[s.headerCount, { color: t.textMuted }]}>{checkedCount} из {items.length}</Text>
        </View>
      )}
      {items.map((item) => (
        <View key={item.id} style={[s.itemRow, { borderBottomColor: t.separatorLight }]}>
          <TouchableOpacity onPress={() => toggleItem(item.id)} style={s.checkbox}>
            <Ionicons name={item.checked ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={item.checked ? t.checkOrange : t.checkEmpty} />
          </TouchableOpacity>
          <TextInput style={[s.itemInput, { color: t.textDark }, item.checked && { textDecorationLine: 'line-through', color: t.textMuted }]} value={item.text} onChangeText={(text) => updateText(item.id, text)} placeholder="Новый пункт" placeholderTextColor={t.textPlaceholder} />
          <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle-outline" size={18} color={t.textLight} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={s.addBtn} onPress={addItem}>
        <Ionicons name="add-circle-outline" size={18} color={t.accent} />
        <Text style={[s.addBtnText, { color: t.accent }]}>Добавить пункт</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  headerCount: { fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8, borderBottomWidth: 0.5 },
  checkbox: { padding: 2 },
  itemInput: { flex: 1, fontSize: 15, paddingVertical: 6, lineHeight: 22 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  addBtnText: { fontSize: 14, fontWeight: '500' },
});
