import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';

export default function SalesListScreen() {
  const sales = useTable('sales') as Record<string, any>;
  const products = useTable('products') as Record<string, any>;
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const scheme = useColorScheme() ?? 'light';
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mês'>('hoje');

  const groups = useMemo(() => {
    const arr = Object.entries(sales ?? {}) as [string, any][];
    const map = new Map<string, { items: [string, any][], timestamp: number }>();
    for (const [id, s] of arr) {
      const gid = String(s?.saleId ?? id);
      const ts = Number(s?.timestamp || 0);
      const g = map.get(gid);
      if (g) {
        g.items.push([id, s]);
        g.timestamp = Math.max(g.timestamp, ts);
      } else {
        map.set(gid, { items: [[id, s]], timestamp: ts });
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1].timestamp - a[1].timestamp);
  }, [sales]);

  const visibleGroups = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const inPeriod = (ts: number) => {
      if (period === 'hoje') return ts >= startOfDay;
      if (period === 'semana') return ts >= weekAgo;
      return ts >= startOfMonth; // mês
    };
    return groups.filter(([, g]) => inPeriod(Number(g.timestamp || 0)));
  }, [groups, period]);

  const periodTotal = useMemo(() => {
    return visibleGroups.reduce((sum, [, g]) => {
      return (
        sum +
        g.items.reduce((acc, [, s]) => {
          const p = products?.[String(s.productId)];
          const price = Number(p?.price || 0);
          const qty = Number(s?.quantity || 0);
          return acc + price * qty;
        }, 0)
      );
    }, 0);
  }, [visibleGroups, products]);

  return (
    <ScrollContainer style={{ backgroundColor: bgColor }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Title style={{ color: textColor }}>Vendas</Title>
        <Ionicons onPress={() => router.push('/(tabs)/sales/new')} name={'add-circle-outline'} size={32} color={textColor} />
      </View>
      <FilterRow>
        {(['hoje', 'semana', 'mês'] as const).map((p) => (
          <FilterButton
            key={p}
            onPress={() => setPeriod(p)}
            style={{ backgroundColor: period === p ? (scheme === 'dark' ? '#2e7d32' : '#2e7d32') : (scheme === 'dark' ? '#333' : '#eee') }}
          >
            <FilterText style={{ color: textColor }}>
              {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Semana' : 'Mês'}
            </FilterText>
          </FilterButton>
        ))}
      </FilterRow>
      <TotalPeriodRow style={{ backgroundColor: cardBg }}>
        <TotalPeriodLabel style={{ color: textColor }}>Total do período</TotalPeriodLabel>
        <TotalPeriodValue style={{ color: textColor }}>R$ {periodTotal.toFixed(2)}</TotalPeriodValue>
      </TotalPeriodRow>
      {visibleGroups.length === 0 ? (
        <Placeholder style={{ color: textColor }}>Nenhuma venda registrada</Placeholder>
      ) : (
        <List>
          {visibleGroups.map(([gid, g]) => {
            const groupDate = new Date(g.timestamp);
            const groupTotal = g.items.reduce((sum, [, s]) => {
              const p = products?.[String(s.productId)];
              const price = Number(p?.price || 0);
              const qty = Number(s?.quantity || 0);
              return sum + price * qty;
            }, 0);
            return (
              <Group key={gid}>
                <GroupHeader>
                  <GroupTitle style={{ color: textColor }}>
                    {isNaN(groupDate.getTime()) ? '-' : groupDate.toLocaleString()}
                  </GroupTitle>
                  <GroupTotal style={{ color: textColor }}>Total: R$ {groupTotal.toFixed(2)}</GroupTotal>
                </GroupHeader>
                {g.items.map(([id, s]) => {
                  const p = products?.[String(s.productId)];
                  const price = Number(p?.price || 0);
                  const qty = Number(s?.quantity || 0);
                  const subtotal = price * qty;
                  return (
                    <SaleRow key={id} style={{ backgroundColor: cardBg }}>
                      <SaleTitle style={{ color: textColor }} numberOfLines={1}>
                        {p?.description ?? 'Produto removido'}
                      </SaleTitle>
                      <SaleMeta style={{ color: textColor }}>
                        Código: {p?.barcode ?? '-'} • Qtd: {qty} • Preço: {price.toFixed(2)} • Subtotal: {subtotal.toFixed(2)}
                      </SaleMeta>
                    </SaleRow>
                  );
                })}
              </Group>
            );
          })}
        </List>
      )}
    </ScrollContainer>
  );
}

const ScrollContainer = styled.ScrollView``;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const Placeholder = styled.Text`
  color: #666;
`;

const List = styled.View``;

const TotalPeriodRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const TotalPeriodLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
`;

const TotalPeriodValue = styled.Text`
  font-size: 20px;
  font-weight: 700;
`;

const Group = styled.View`
  margin-bottom: 12px;
`;

const GroupHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const GroupTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
`;

const GroupTotal = styled.Text`
  font-size: 16px;
  font-weight: 600;
`;

const SaleRow = styled.View`
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const SaleTitle = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const SaleMeta = styled.Text`
  font-size: 12px;
`;

const FilterRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const FilterButton = styled.TouchableOpacity`
  padding: 10px 12px;
  border-radius: 8px;
`;

const FilterText = styled.Text`
  font-size: 14px;
  font-weight: 600;
`;
