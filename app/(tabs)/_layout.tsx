import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const scheme = useColorScheme() ?? 'light';
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />)
        }}
      />
      <Tabs.Screen
        name="products/[id]"
        initialParams={{ id: 'new' }}
        options={{
          title: 'Cadastrar Produto',
          href: null,
          tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />)
        }}
      />
      <Tabs.Screen
        name="sales/new"
        options={{
          title: 'Registrar Venda',
          href: null,
          tabBarIcon: ({ color, size }) => (<Ionicons name="cart" size={size} color={color} />)
        }}
      />
      <Tabs.Screen
        name="sales/index"
        options={{
          title: 'Vendas',
          tabBarIcon: ({ color, size }) => (<Ionicons name="cart" size={size} color={color} />)
        }}
      />
    </Tabs>
  );
}
