import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChecklistItem } from '../types';
import { useTheme, ThemeColors } from './theme';

export interface Block {
  id: string;
  type: 'text' | 'checklist';
  text?: string;
  items?: ChecklistItem[];
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 6); }

export function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

export function deserializeBlocks(content: string, checklist?: ChecklistItem[]): Block[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) return parsed;
  } catch {}
  const blocks: Block[] = [];
  if (content && content.trim()) blocks.push({ id: genId(), type: 'text', text: content });
  if (checklist && checklist.length > 0) blocks.push({ id: genId(), type: 'checklist', items: checklist });
  if (blocks.length === 0) blocks.push({ id: genId(), type: 'text', text: '' });
  return blocks;
}

export function getBlocksPreview(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed[0]?.type) {
      const texts: string[] = [];
      for (const b of parsed) {
        if (b.type === 'text' && b.text) texts.push(b.text);
        if (b.type === 'checklist' && b.items) {
          for (const item of b.items) texts.push(`${item.checked ? '\u2713' : '\u25CB'} ${item.text}`);
        }
      }
      return texts.join(' ').substring(0, 100);
    }
  } catch {}
  return content?.substring(0, 100) || '';
}

export function getBlocksChecklistStats(content: string): { total: number; checked: number } | null {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed[0]?.type) {
      let total = 0, checked = 0;
      for (const b of parsed) {
        if (b.type === 'checklist' && b.items) {
          total += b.items.length;
          checked += b.items.filter((i: any) => i.checked).length;
        }
      }
      if (total > 0) return { total, checked };
    }
  } catch {}
  return null;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const t = useTheme();
  const s = mkStyles(t);

  const updateBlock = (id: string, data: Partial<Block>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    onChange(blocks.filter(b => b.id !== id));
  };

  const insertBlockAfter = (afterId: string, type: 'text' | 'checklist') => {
    const idx = blocks.findIndex(b => b.id === afterId);
    const newBlock: Block = type === 'text'
      ? { id: genId(), type: 'text', text: '' }
      : { id: genId(), type: 'checklist', items: [{ id: genId(), text: '', checked: false }] };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, newBlock);
    onChange(updated);
  };

  const toggleItem = (blockId: string, itemId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.items) return;
    updateBlock(blockId, { items: block.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) });
  };

  const updateItemText = (blockId: string, itemId: string, text: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.items) return;
    updateBlock(blockId, { items: block.items.map(i => i.id === itemId ? { ...i, text } : i) });
  };

  const removeItem = (blockId: string, itemId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.items) return;
    const newItems = block.items.filter(i => i.id !== itemId);
    if (newItems.length === 0) { removeBlock(blockId); return; }
    updateBlock(blockId, { items: newItems });
  };

  const addItem = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.items) return;
    updateBlock(blockId, { items: [...block.items, { id: genId(), text: '', checked: false }] });
  };

  return (
    <View>
      {blocks.map((block, blockIndex) => (
        <View key={block.id}>
          {/* Block content */}
          {block.type === 'text' ? (
            <TextInput
              style={s.textInput}
              value={block.text}
              onChangeText={(text) => updateBlock(block.id, { text })}
              placeholder="Продолжите писать..."
              placeholderTextColor={t.textPlaceholder}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={s.checklistContainer}>
              {block.items?.map((item) => (
                <View key={item.id} style={s.checkRow}>
                  <TouchableOpacity onPress={() => toggleItem(block.id, item.id)} style={s.checkBtn}>
                    <View style={[s.checkCircle, item.checked ? s.checkCircleChecked : s.checkCircleEmpty]}>
                      {item.checked && <Ionicons name="checkmark" size={14} color="#000" />}
                    </View>
                  </TouchableOpacity>
                  <TextInput
                    style={[s.checkInput, item.checked && s.checkInputChecked]}
                    value={item.text}
                    onChangeText={(text) => updateItemText(block.id, item.id, text)}
                    placeholder="Пункт"
                    placeholderTextColor={t.textPlaceholder}
                  />
                  <TouchableOpacity onPress={() => removeItem(block.id, item.id)} style={s.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle-outline" size={16} color={t.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={s.addItemRow} onPress={() => addItem(block.id)}>
                <View style={[s.checkCircle, s.checkCircleEmpty, { opacity: 0.4 }]} />
                <Text style={s.addItemText}>Добавить пункт</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add block buttons between blocks */}
          <View style={s.addBlockRow}>
            <TouchableOpacity style={s.addBlockBtn} onPress={() => insertBlockAfter(block.id, 'text')}>
              <Ionicons name="add" size={14} color={t.accent} />
              <Text style={s.addBlockBtnText}>Текст</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.addBlockBtn} onPress={() => insertBlockAfter(block.id, 'checklist')}>
              <Ionicons name="add" size={14} color={t.accent} />
              <Text style={s.addBlockBtnText}>Чек-лист</Text>
            </TouchableOpacity>
            {blocks.length > 1 && (
              <TouchableOpacity style={s.addBlockBtn} onPress={() => removeBlock(block.id)}>
                <Ionicons name="trash-outline" size={14} color={t.deleteRed} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  textInput: { fontSize: 16, lineHeight: 24, minHeight: 48, paddingVertical: 4, color: t.textBody },
  checklistContainer: { marginVertical: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', minHeight: 36, paddingVertical: 2 },
  checkBtn: { width: 28, justifyContent: 'center', alignItems: 'center' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  checkCircleChecked: { backgroundColor: t.accent },
  checkCircleEmpty: { borderWidth: 1.5, borderColor: t.checkEmpty },
  checkInput: { flex: 1, fontSize: 16, lineHeight: 22, paddingVertical: 4, paddingLeft: 8, color: t.textBody },
  checkInputChecked: { textDecorationLine: 'line-through', color: t.textMuted },
  removeBtn: { width: 28, justifyContent: 'center', alignItems: 'center' },
  addItemRow: { flexDirection: 'row', alignItems: 'center', minHeight: 36, paddingVertical: 2, marginLeft: 3 },
  addItemText: { fontSize: 15, color: t.textMuted, paddingLeft: 8 },
  addBlockRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 6, marginVertical: 2,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.separatorLight,
  },
  addBlockBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4, paddingHorizontal: 4 },
  addBlockBtnText: { fontSize: 13, color: t.accent, fontWeight: '500' },
});
