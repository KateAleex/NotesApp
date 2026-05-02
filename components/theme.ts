import { useColorScheme } from 'react-native';

const light = {
  background: '#F2F1F6',
  cardBg: '#FFFFFF',
  header: '#F2F1F6',
  headerText: '#000000',
  accent: '#FFD60A',
  accentDark: '#E8C200',
  accentLight: '#FFF9D6',
  textDark: '#000000',
  textBody: '#1C1C1E',
  textMuted: '#8E8E93',
  textLight: '#AEAEB2',
  textPlaceholder: '#C7C7CC',
  separator: '#C6C6C8',
  separatorLight: '#E5E5EA',
  deleteRed: '#FF3B30',
  checkGreen: '#34C759',
  checkOrange: '#FFD60A',
  checkEmpty: '#C7C7CC',
  white: '#FFFFFF',
  offWhite: '#F2F1F6',
  paperBg: '#FFFFFF',
  marginLine: '#E8B4B4',
  inputBg: '#E5E5EA',
  modalOverlay: 'rgba(0,0,0,0.4)',
  folderYellow: '#FFD60A',
  searchBg: 'rgba(118,118,128,0.12)',
  sectionHeaderText: '#6D6D72',
  groupedCardBg: '#FFFFFF',
  toolbarBg: '#F2F1F6',
  statusBar: 'dark' as 'dark' | 'light',
};

const dark = {
  background: '#000000',
  cardBg: '#1C1C1E',
  header: '#000000',
  headerText: '#FFFFFF',
  accent: '#FFD60A',
  accentDark: '#FFE04A',
  accentLight: '#3A3200',
  textDark: '#FFFFFF',
  textBody: '#E5E5EA',
  textMuted: '#8E8E93',
  textLight: '#636366',
  textPlaceholder: '#48484A',
  separator: '#38383A',
  separatorLight: '#2C2C2E',
  deleteRed: '#FF453A',
  checkGreen: '#30D158',
  checkOrange: '#FFD60A',
  checkEmpty: '#48484A',
  white: '#1C1C1E',
  offWhite: '#000000',
  paperBg: '#1C1C1E',
  marginLine: '#5A3A3A',
  inputBg: '#2C2C2E',
  modalOverlay: 'rgba(0,0,0,0.7)',
  folderYellow: '#FFD60A',
  searchBg: 'rgba(118,118,128,0.24)',
  sectionHeaderText: '#8E8E93',
  groupedCardBg: '#1C1C1E',
  toolbarBg: '#1C1C1E',
  statusBar: 'light' as 'dark' | 'light',
};

export type ThemeColors = typeof light;

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const colors = light;
