import { Product } from '@/src/types';
import React from 'react';
import { FlatList, FlatListProps, Image } from 'react-native';
import styled from 'styled-components/native';
import { useTable } from 'tinybase/ui-react';

type ListItem = [string, Product];

export default function ProductsListScreen() {
  // const products = useTable('products') as Record<string, any>;
  // const data = Object.entries(products ?? {});
  const products = useTable('products') as Record<string, Product> | null;
  const data: ListItem[] = Object.entries(products ?? {}) as ListItem[];

  return (
    <Container>
      <Title>Produtos</Title>
      <List
        data={data}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => {
          const [id, p] = item;
          return (
            <Item>
              {p.image ? <ProductImage source={{ uri: p.image }} /> : null}
              <ItemInfo>
                <ItemTitle>{p.description}</ItemTitle>
                <ItemText>Código: {p.barcode}</ItemText>
                <ItemText>Preço: {Number(p.price).toFixed(2)}</ItemText>
                <ItemText>Qtd: {p.quantity}</ItemText>
              </ItemInfo>
            </Item>
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