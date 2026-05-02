import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from './theme';

const LINE_HEIGHT = 28;
const LINE_COUNT = 40;
const TOP_OFFSET = 44; // after title

interface LinedPaperProps {
  children: React.ReactNode;
}

export function LinedPaper({ children }: LinedPaperProps) {
  const t = useTheme();
  const lines = Array.from({ length: LINE_COUNT }, (_, i) => i);

  return (
    <View style={[s.paper, { backgroundColor: t.paperBg, borderColor: t.separator }]}>
      <View style={s.linesContainer} pointerEvents="none">
        {lines.map(i => (
          <View key={i} style={[s.line, { top: TOP_OFFSET + i * LINE_HEIGHT, backgroundColor: t.separator }]} />
        ))}
        <View style={[s.marginLine, { backgroundColor: t.separator }]} />
      </View>
      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  paper: { borderRadius: 6, position: 'relative', minHeight: LINE_HEIGHT * 20, overflow: 'hidden', borderWidth: 0.5 },
  linesContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  line: { position: 'absolute', left: 0, right: 0, height: 0.5 },
  marginLine: { position: 'absolute', top: 0, bottom: 0, left: 36, width: 0.5, opacity: 0.4 },
  content: { paddingLeft: 44, paddingRight: 14, paddingTop: 8, paddingBottom: 20 },
});
