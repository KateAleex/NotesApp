import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from './theme';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const s = mkStyles(t);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { query.trim() ? onSearch(query.trim()) : onClear(); }, 300);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [query]);

  return (
    <View style={s.container}>
      <Ionicons name="search" size={16} color={t.textLight} style={s.icon} />
      <TextInput style={s.input} placeholder="Поиск" placeholderTextColor={t.textMuted} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => { setQuery(''); onClear(); }} style={s.clearBtn}>
          <Ionicons name="close-circle" size={16} color={t.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const mkStyles = (t: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 10,
    paddingHorizontal: 10, marginHorizontal: 16, marginVertical: 8,
    height: 36, backgroundColor: t.searchBg,
  },
  icon: { marginRight: 6 },
  input: { flex: 1, fontSize: 16, color: t.textDark },
  clearBtn: { padding: 4 },
});
