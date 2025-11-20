import { store } from '@/src/store';
import { syncToServer } from '@/src/sync';
import { CameraView } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';

export default function SaleNewScreen() {
  const products = useTable('products') as Record<string, any>;
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [scanOpen, setScanOpen] = useState(false);

  const selected = useMemo(() => (selectedProductId ? products?.[selectedProductId] : undefined), [products, selectedProductId]);

  const findProductByBarcode = (code: string) => {
    const entry = Object.entries(products ?? {}).find(([, p]) => String(p.barcode) === String(code));
    if (entry) setSelectedProductId(entry[0]);
  };

  const saveSale = async () => {
    if (!selectedProductId) return;
    const qty = Number(quantity) || 0;
    const id = Crypto.randomUUID();
    store.setRow('sales', id, { productId: selectedProductId, quantity: qty, timestamp: Date.now() });
    const current = Number(store.getCell('products', selectedProductId, 'quantity') || 0);
    store.setCell('products', selectedProductId, 'quantity', Math.max(current - qty, 0));
    await syncToServer();
    setQuantity('');
  };

  return (
    <Container>
      <Title>Registrar Venda</Title>
      <Field>
        <Label>Produto</Label>
        {selected ? (
          <Selected>
            <SelectedTitle>{selected.description}</SelectedTitle>
            <SelectedText>Estoque: {selected.quantity}</SelectedText>
            <SelectedText>Preço: {Number(selected.price).toFixed(2)}</SelectedText>
          </Selected>
        ) : (
          <Placeholder>Nenhum produto selecionado</Placeholder>
        )}
        <Row>
          <Button onPress={() => setScanOpen(true)}>
            <ButtonText>Escanear código</ButtonText>
          </Button>
        </Row>
      </Field>
      <Field>
        <Label>Quantidade</Label>
        <Input keyboardType="number-pad" value={quantity} onChangeText={setQuantity} placeholder="0" />
      </Field>
      <ButtonPrimary onPress={saveSale} disabled={!selectedProductId || !quantity}>
        <ButtonPrimaryText>Salvar</ButtonPrimaryText>
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
                findProductByBarcode(String(data));
                setScanOpen(false);
              }}>
            </CameraView>
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

const Selected = styled.View`
  padding: 12px;
  background: #fff;
  border-radius: 8px;
`;

const SelectedTitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
`;

const SelectedText = styled.Text`
  font-size: 14px;
  color: #444;
`;