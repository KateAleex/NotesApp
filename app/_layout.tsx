import { Stack } from 'expo-router';
import { NotesProvider } from '../context/NotesContext';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../components/theme';

function StackLayout() {
  const t = useTheme();

  return (
    <>
      <StatusBar style={t.statusBar} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.background },
          headerTintColor: t.accent,
          headerTitleStyle: { fontWeight: '600', fontSize: 17, color: t.headerText },
          contentStyle: { backgroundColor: t.background },
          headerShadowVisible: false,
          headerBackTitle: 'Назад',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="folder/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="note/create" options={{ title: 'Новая заметка', presentation: 'modal' }} />
        <Stack.Screen name="note/[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <NotesProvider>
      <StackLayout />
    </NotesProvider>
  );
}
