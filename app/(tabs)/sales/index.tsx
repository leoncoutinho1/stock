import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo } from 'react';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';

export default function SalesListScreen() {
  const sales = useTable('sales') as Record<string, any>;
  const products = useTable('products') as Record<string, any>;
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const scheme = useColorScheme() ?? 'light';
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';

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

  return (
    <Container style={{ backgroundColor: bgColor }}>
      <Title style={{ color: textColor }}>Vendas realizadas</Title>
      {groups.length === 0 ? (
        <Placeholder style={{ color: textColor }}>Nenhuma venda registrada</Placeholder>
      ) : (
        <List>
          {groups.map(([gid, g]) => {
            const groupDate = new Date(g.timestamp);
            return (
              <Group key={gid}>
                <GroupTitle style={{ color: textColor }}>
                  {isNaN(groupDate.getTime()) ? '-' : groupDate.toLocaleString()}
                </GroupTitle>
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
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const Placeholder = styled.Text`
  color: #666;
`;

const List = styled.View``;

const Group = styled.View`
  margin-bottom: 12px;
`;

const GroupTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
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
