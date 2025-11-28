import { useColorScheme } from '@/hooks/use-color-scheme';
import { createPersister, store } from '@/src/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider, useCreatePersister } from 'tinybase/ui-react';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <Persistence />
        <SafeAreaView style={{ flex: 1 }} >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </SafeAreaView>
      </Provider>
    </ThemeProvider>
  );
}

function Persistence() {
  useCreatePersister(store, () => createPersister(), [], async (persister) => {
    await persister.startAutoLoad();
    const products = store.getTable?.('products') ?? {};
    for (const id of Object.keys(products)) {
      const active = store.getCell('products', id, 'ind_active');
      if (typeof active === 'undefined') {
        store.setCell('products', id, 'ind_active', true);
      }
    }
    await persister.startAutoSave();
  });
  return null;
}
