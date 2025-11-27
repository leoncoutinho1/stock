import { store } from '@/src/store';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { useRow } from 'tinybase/ui-react';

export default function ProductEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const row = useRow('products', String(id)) as any;
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [barcode, setBarcode] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView | null>(null);
  const scannerRef = React.useRef<CameraView | null>(null);

  useEffect(() => {
    if (row) {
      setDescription(String(row.description ?? ''));
      setCost(String(row.cost ?? ''));
      setPrice(String(row.price ?? ''));
      setQuantity(String(row.quantity ?? ''));
      setBarcode(String(row.barcode ?? ''));
      setImageUri(String(row.image ?? ''));
    }
  }, [id, row]);

  const saveChanges = async () => {
    store.setRow('products', String(id), {
      description: description.trim(),
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      barcode: barcode.trim(),
      image: imageUri,
    });
    router.back();
  };

  const delProduct = async () => {
    Alert.alert('Remover produto', 'Deseja remover este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          store.delRow('products', String(id));
          if (imageUri) {
            try { 
              new File(imageUri).delete();
            } catch {}
          }
          router.replace('/(tabs)/products/index');
        },
      },
    ]);
  };

  async function saveImage(capturedUri: string) {
    try {
      // nome único
      const fileName = `foto_${Crypto.randomUUID()}.jpg`;

      // cria um File apontando para o destino no documentDirectory
      const destinationFile = new File(Paths.document, fileName);

      // cria o arquivo no diretório (somente o path; o conteúdo virá via copy)
      await destinationFile.create();

      console.log("Imagem salva em:", destinationFile.uri);

      return destinationFile.uri;
    } catch (error) {
      console.error("Erro ao salvar imagem:", error);
      throw error;
    }
  }

  const takePhoto = async (
    camera: any
  ) => {
    try {
      const photo = await camera.takePictureAsync({ quality: 0.8, base64: false });
      if (!photo) return;

      await saveImage(photo.uri);
      setImageUri(photo.uri)
      setCameraOpen(false)
    } catch (err) {
      console.error("Erro ao salvar foto:", err);
    }
  };

  return (
    <Container>
      <Title>Editar Produto</Title>
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

      <Row style={{ gap: 12 }}>
        <ButtonPrimary onPress={saveChanges} disabled={!description}>
          <ButtonPrimaryText>Salvar alterações</ButtonPrimaryText>
        </ButtonPrimary>
        <ButtonDestructive onPress={delProduct}>
          <ButtonPrimaryText>Apagar produto</ButtonPrimaryText>
        </ButtonDestructive>
      </Row>

      {cameraOpen && (
        <Modal>
          <CameraView 
            style={{ flex: 1 }} 
            ref={(ref) => {
              cameraRef.current = ref;
            }}
          />
          <CameraOverlay>
            <Button onPress={() => setCameraOpen(false)}>
              <ButtonText>Fechar</ButtonText>
            </Button>
            <ButtonPrimary
              onPress={async () => {
                if (cameraRef) {
                  await takePhoto(cameraRef.current);
                }
              }}
            >
              <ButtonPrimaryText>Capturar</ButtonPrimaryText>
            </ButtonPrimary>
          </CameraOverlay>
        </Modal>
      )}

      {scanOpen && (
        <Modal>
          <ScannerContainer>
            <CameraView
              style={{ flex: 1 }}
              ref={(ref) => {
                if (ref) scannerRef.current = ref;
              }}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'code128'],
              }}
              onBarcodeScanned={({ data }) => {
                setBarcode(String(data));
                setScanOpen(false);
              }}
            />

            <CameraOverlay>
              <Button onPress={() => setScanOpen(false)}>
                <ButtonText>Fechar</ButtonText>
              </Button>
            </CameraOverlay>
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
`;

const ButtonDestructive = styled.TouchableOpacity`
  padding: 14px 16px;
  background: #c62828;
  border-radius: 10px;
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