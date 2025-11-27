import { store } from '@/src/store';
import { syncToServer } from '@/src/sync';
import { CameraView } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';

export default function SaleNewScreen() {
  const products = useTable('products') as Record<string, any>;
  const [scanOpen, setScanOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const entries = Object.entries(products ?? {}) as [string, any][];
    if (!q) return entries;
    return entries.filter(([, p]) =>
      String(p.description ?? '').toLowerCase().includes(q) || String(p.barcode ?? '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = products?.[it.productId];
      const price = Number(p?.price || 0);
      return sum + price * it.quantity;
    }, 0);
  }, [items, products]);

  const addItemByProductId = (productId: string, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { productId, quantity: qty }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateItemQty = (productId: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(qty, 0) } : i)));
  };

  const addByBarcode = (code: string) => {
    const entry = Object.entries(products ?? {}).find(([, p]) => String(p.barcode) === String(code));
    if (entry) addItemByProductId(entry[0], 1);
  };

  const saveSale = async () => {
    if (!items.length) return;
    for (const it of items) {
      const qty = Math.max(Number(it.quantity) || 0, 0);
      if (!qty) continue;
      const id = Crypto.randomUUID();
      store.setRow('sales', id, { productId: it.productId, quantity: qty, timestamp: Date.now() });
      const current = Number(store.getCell('products', it.productId, 'quantity') || 0);
      store.setCell('products', it.productId, 'quantity', Math.max(current - qty, 0));
    }
    await syncToServer();
    setItems([]);
    setSearch('');
  };

  return (
    <Container>
      <Title>Registrar Venda</Title>
      <Field>
        <Label>Pesquisar por nome ou código</Label>
        <Input value={search} onChangeText={setSearch} placeholder="Digite o nome ou código" />
        <ProductsList>
          {filteredProducts.map(([id, p]) => (
            <ProductRow key={id}>
              <ProductTitle numberOfLines={1}>{p.description}</ProductTitle>
              <ProductMeta>
                Código: {p.barcode} • Preço: {Number(p.price).toFixed(2)} • Estoque: {p.quantity}
              </ProductMeta>
              <Row style={{ justifyContent: 'flex-end' }}>
                <Button onPress={() => addItemByProductId(id, 1)}>
                  <ButtonText>Adicionar</ButtonText>
                </Button>
              </Row>
            </ProductRow>
          ))}
        </ProductsList>
        <Row>
          <Button onPress={() => setScanOpen(true)}>
            <ButtonText>Escanear código</ButtonText>
          </Button>
        </Row>
      </Field>

      <Field>
        <Label>Itens da venda</Label>
        {items.length === 0 ? (
          <Placeholder>Nenhum item adicionado</Placeholder>
        ) : (
          <Cart>
            {items.map((it) => {
              const p = products?.[it.productId];
              const price = Number(p?.price || 0);
              const subtotal = price * it.quantity;
              return (
                <CartItem key={it.productId}>
                  <CartTitle numberOfLines={1}>{p?.description}</CartTitle>
                  <CartMeta>Preço: {price.toFixed(2)} • Subtotal: {subtotal.toFixed(2)}</CartMeta>
                  <Row style={{ gap: 8 }}>
                    <Input
                      style={{ flex: 1 }}
                      keyboardType="number-pad"
                      value={String(it.quantity)}
                      onChangeText={(t) => updateItemQty(it.productId, Number(t) || 0)}
                      placeholder="Qtd"
                    />
                    <Button onPress={() => removeItem(it.productId)}>
                      <ButtonText>Remover</ButtonText>
                    </Button>
                  </Row>
                </CartItem>
              );
            })}
          </Cart>
        )}
      </Field>

      <TotalRow>
        <TotalLabel>Total</TotalLabel>
        <TotalValue>R$ {total.toFixed(2)}</TotalValue>
      </TotalRow>

      <ButtonPrimary onPress={saveSale} disabled={!items.length}>
        <ButtonPrimaryText>Salvar venda</ButtonPrimaryText>
      </ButtonPrimary>

      {scanOpen && (
        <Modal>
          <ScannerContainer>
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'code128'],
              }}
              onBarcodeScanned={({ data }) => {
                addByBarcode(String(data));
                setScanOpen(false);
              }}
            />
            <Button onPress={() => setScanOpen(false)}>
              <ButtonText>Fechar</ButtonText>
            </Button>
          </ScannerContainer>
        </Modal>
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

const Field = styled.View`
  margin-bottom: 12px;
`;

const Label = styled.Text`
  font-size: 14px;
  margin-bottom: 4px;
`;

const Placeholder = styled.Text`
  color: #666;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const Button = styled.TouchableOpacity`
  padding: 12px 16px;
  background: #eee;
  border-radius: 8px;
`;

const ButtonText = styled.Text`
  font-weight: 500;
`;

const ButtonPrimary = styled.TouchableOpacity<{ disabled?: boolean }>`
  padding: 14px 16px;
  background: ${({ disabled }) => (disabled ? '#aaa' : '#2e7d32')};
  border-radius: 10px;
  margin-top: 16px;
`;

const ButtonPrimaryText = styled.Text`
  color: #fff;
  text-align: center;
  font-weight: 600;
`;

const Input = styled.TextInput`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
`;

const Modal = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #000;
`;

const ScannerContainer = styled.View`
  flex: 1;
`;

const ProductsList = styled.View``;

const ProductRow = styled.View`
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ProductTitle = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const ProductMeta = styled.Text`
  font-size: 12px;
  color: #555;
`;

const Cart = styled.View``;

const CartItem = styled.View`
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const CartTitle = styled.Text`
  font-size: 16px;
  font-weight: 500;
`;

const CartMeta = styled.Text`
  font-size: 12px;
  color: #555;
  margin-bottom: 8px;
`;

const TotalRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
`;

const TotalLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
`;

const TotalValue = styled.Text`
  font-size: 20px;
  font-weight: 700;
`;
