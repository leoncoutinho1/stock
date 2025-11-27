import { store } from '@/src/store';
import { Product } from '@/src/types';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, FlatListProps, Image } from 'react-native';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';

type ListItem = [string, Product];

export default function ProductsListScreen() {
  const router = useRouter();
  const products = useTable('products') as Record<string, Product> | null;
  const data: ListItem[] = (Object.entries(products ?? {}) as ListItem[]).filter(([, p]) => p?.ind_active !== false);

  const confirmDelete = (id: string, image?: string) => {
    Alert.alert('Desativar produto', 'Deseja desativar este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: async () => {
          store.setCell('products', id, 'ind_active', false);
        },
      },
    ]);
  };

  return (
    <Container>
      <Title>Produtos</Title>
      <List
        data={data}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [id, p] = item;
          return (
            <ItemTouchable
              onPress={() => router.push({ pathname: '/(tabs)/products/[id]', params: { id } })}
              onLongPress={() => confirmDelete(id, p.image)}
            >
              <Item>
                {p.image ? <ProductImage source={{ uri: p.image }} /> : null}
                <ItemInfo>
                  <ItemTitle>{p.description}</ItemTitle>
                  <ItemText>Código: {p.barcode}</ItemText>
                  <ItemText>Preço: {Number(p.price).toFixed(2)}</ItemText>
                  <ItemText>Qtd: {p.quantity}</ItemText>
                </ItemInfo>
              </Item>
            </ItemTouchable>
          );
        }}
      />
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

//const List = styled.FlatList`` as unknown as typeof styled.FlatList;
const List = styled(FlatList as new (props: FlatListProps<ListItem>) => FlatList<ListItem>)`` as unknown as typeof FlatList<ListItem>;

const ItemTouchable = styled.TouchableOpacity``;

const Item = styled.View`
  flex-direction: row;
  padding: 12px;
  border-radius: 8px;
  background-color: #fff;
  margin-bottom: 12px;
  elevation: 1;
`;

const ProductImage = styled(Image)`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 12px;
`;

const ItemInfo = styled.View`
  flex: 1;
`;

const ItemTitle = styled.Text`
  font-size: 18px;
  font-weight: 500;
`;

const ItemText = styled.Text`
  font-size: 14px;
  color: #444;
`;
