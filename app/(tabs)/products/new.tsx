import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components/native';
import { store } from '@/src/store';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { syncToServer } from '@/src/sync';

export default function ProductNewScreen() {
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [barcodePermission, setBarcodePermission] = useState(false);

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then((res) => setBarcodePermission(res.status === 'granted'));
  }, []);

  const saveProduct = async () => {
    const id = Crypto.randomUUID();
    const p = {
      description: description.trim(),
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      barcode: barcode.trim(),
      image: imageUri,
    };
    store.setRow('products', id, p);
    await syncToServer();
    setDescription('');
    setCost('');
    setPrice('');
    setQuantity('');
    setBarcode('');
    setImageUri('');
  };

  const takePhoto = async (camera: any) => {
    const photo = await camera.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) {
      const target = `${FileSystem.documentDirectory}images/${Crypto.randomUUID()}.jpg`;
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true }).catch(() => {});
      await FileSystem.copyAsync({ from: photo.uri, to: target });
      setImageUri(target);
      setCameraOpen(false);
    }
  };

  return (
    <Container>
      <Title>Cadastrar Produto</Title>
      <Field>
        <Label>Descrição</Label>
        <Input value={description} onChangeText={setDescription} placeholder="Descrição" />
      </Field>
      <Row>
        <Field style={{ flex: 1 }}>
          <Label>Custo</Label>
          <Input keyboardType="decimal-pad" value={cost} onChangeText={setCost} placeholder="0.00" />
        </Field>
        <Spacer />
        <Field style={{ flex: 1 }}>
          <Label>Preço</Label>
          <Input keyboardType="decimal-pad" value={price} onChangeText={setPrice} placeholder="0.00" />
        </Field>
      </Row>
      <Field>
        <Label>Quantidade</Label>
        <Input keyboardType="number-pad" value={quantity} onChangeText={setQuantity} placeholder="0" />
      </Field>
      <Row>
        <Field style={{ flex: 1 }}>
          <Label>Código de barras</Label>
          <Input value={barcode} onChangeText={setBarcode} placeholder="Digite ou escaneie" />
        </Field>
        <Spacer />
        <Button onPress={() => setScanOpen(true)}>
          <ButtonText>Escanear</ButtonText>
        </Button>
      </Row>
      <ImageRow>
        {imageUri ? <ProductImage source={{ uri: imageUri }} /> : <Placeholder>Sem imagem</Placeholder>}
        <Button onPress={async () => {
          if (!permission?.granted) {
            await requestPermission();
          }
          setCameraOpen(true);
        }}>
          <ButtonText>Tirar foto</ButtonText>
        </Button>
      </ImageRow>
      <ButtonPrimary onPress={saveProduct} disabled={!description}>
        <ButtonPrimaryText>Salvar</ButtonPrimaryText>
      </ButtonPrimary>

      {cameraOpen && (
        <Modal>
          <CameraView style={{ flex: 1 }}>
            {({ camera }) => (
              <CameraOverlay>
                <Button onPress={() => setCameraOpen(false)}>
                  <ButtonText>Fechar</ButtonText>
                </Button>
                <ButtonPrimary onPress={() => takePhoto(camera)}>
                  <ButtonPrimaryText>Capturar</ButtonPrimaryText>
                </ButtonPrimary>
              </CameraOverlay>
            )}
          </CameraView>
        </Modal>
      )}

      {scanOpen && (
        <Modal>
          <ScannerContainer>
            <BarCodeScanner
              onBarCodeScanned={({ data }) => {
                setBarcode(String(data));
                setScanOpen(false);
              }}
              style={{ flex: 1 }}
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

const Input = styled.TextInput`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Spacer = styled.View`
  width: 12px;
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

const ImageRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.Image`
  width: 96px;
  height: 96px;
  border-radius: 8px;
  margin-right: 12px;
`;

const Placeholder = styled.Text`
  color: #666;
  margin-right: 12px;
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

const CameraOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: rgba(0,0,0,0.5);
  gap: 12px;
`;