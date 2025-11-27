import React, { useMemo } from 'react';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SalesListScreen() {
  const sales = useTable('sales') as Record<string, any>;
  const products = useTable('products') as Record<string, any>;
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const scheme = useColorScheme() ?? 'light';
  const cardBg = scheme === 'dark' ? '#1f1f1f' : '#fff';

  const entries = useMemo(() => {
    const arr = Object.entries(sales ?? {}) as [string, any][];
    return arr.sort((a, b) => Number(b[1]?.timestamp || 0) - Number(a[1]?.timestamp || 0));
  }, [sales]);

  return (
    <Container style={{ backgroundColor: bgColor }}>
      <Title style={{ color: textColor }}>Vendas realizadas</Title>
      {entries.length === 0 ? (
        <Placeholder style={{ color: textColor }}>Nenhuma venda registrada</Placeholder>
      ) : (
        <List>
          {entries.map(([id, s]) => {
            const p = products?.[String(s.productId)];
            const price = Number(p?.price || 0);
            const qty = Number(s?.quantity || 0);
            const subtotal = price * qty;
            const date = new Date(Number(s?.timestamp || 0));
            return (
              <SaleRow key={id} style={{ backgroundColor: cardBg }}>
                <SaleTitle style={{ color: textColor }} numberOfLines={1}>
                  {p?.description ?? 'Produto removido'}
                </SaleTitle>
                <SaleMeta style={{ color: textColor }}>
                  Código: {p?.barcode ?? '-'} • Qtd: {qty} • Preço: {price.toFixed(2)} • Subtotal: {subtotal.toFixed(2)}
                </SaleMeta>
                <SaleMeta style={{ color: textColor }}>
                  {isNaN(date.getTime()) ? '-' : date.toLocaleString()}
                </SaleMeta>
              </SaleRow>
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

