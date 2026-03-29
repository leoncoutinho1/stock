import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { saleApi } from "@/src/api/sale";
import { SalesTotalsDTO } from "@/src/api/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SalesListScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "background");
  const cardBg = scheme === "dark" ? "#1f1f1f" : "#FFFFFF";
  const borderColor = scheme === "dark" ? "#333" : "#E5E5EA";

  const [salesTotals, setSalesTotals] = useState<SalesTotalsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const totals = await saleApi.getSalesTotals();
      console.log("passou aqui2");
      setSalesTotals(totals || []);
    } catch (error) {
      console.error("Erro ao carregar totais de vendas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderTotalCard = ({ item }: { item: SalesTotalsDTO }) => {
    const startDateStr = new Date(item.startDate).toLocaleDateString("pt-BR");
    const endDateStr = new Date(item.endDate).toLocaleDateString("pt-BR");

    return (
      <View
        style={[styles.groupCard, { backgroundColor: cardBg, borderColor }]}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupHeaderLeft}>
            <Ionicons name="bar-chart-outline" size={24} color="#34C759" />
            <Text style={[styles.groupDate, { color: textColor }]}>
              {item.period}
            </Text>
          </View>
          <Text style={[styles.groupTotal, { color: "#34C759" }]}>
            R$ {Number(item.totalValue).toFixed(2)}
          </Text>
        </View>
        <View style={[styles.groupFooter, { borderColor }]}>
          <Text style={[styles.itemsCount, { color: textColor, opacity: 0.6 }]}>
            Período: {startDateStr} a {endDateStr}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="cart-outline"
          size={64}
          color={textColor}
          style={{ opacity: 0.3 }}
        />
        <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
          Nenhuma venda registrada
        </Text>
      </View>
    );
  };

  if (loading && salesTotals.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: bgColor },
        ]}
      >
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Vendas</Text>
      </View>

      {/* Sales Totals List */}
      <FlatList
        data={salesTotals}
        renderItem={renderTotalCard}
        keyExtractor={(item, index) => `${item.period}-${index}`}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/sales/new")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  groupCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  groupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  groupDate: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  groupTotal: {
    fontSize: 20,
    fontWeight: "bold",
  },
  groupFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  itemsCount: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
