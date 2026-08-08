import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { cashierApi } from "@/src/api/cashier";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { theme } from "@/src/styles/theme";

export const Cashiers: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.getCashiers();
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await cashierApi.createCashier({ name: name.trim() });
      setName("");
      loadItems();
    } catch (e) {
      window.alert("Erro ao criar caixa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm("Excluir este caixa?")) return;
    try {
      await cashierApi.deleteCashier(id);
      loadItems();
    } catch (e) {
      window.alert("Erro ao excluir.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Wallet color={theme.colors.primary} size={16} />
          <Text style={styles.cardTitle}>Novo Operador de Caixa</Text>
        </View>

        <View style={styles.formRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="ex: Caixa Principal, Operador João"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleCreate}
            disabled={submitting}
            style={[styles.saveButton, submitting && styles.buttonDisabled]}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={theme.colors.textWhite} size="small" />
            ) : (
              <>
                <Plus color={theme.colors.textWhite} size={16} />
                <Text style={styles.saveButtonText}>Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeaderTitle}>Caixas Cadastrados</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum caixa cadastrado.</Text>
        ) : (
          <View style={styles.listContainer}>
            {items.map((c) => {
              const label = c.name || c.description || c.title || `Caixa #${c.id}`;
              return (
                <View key={c.id} style={styles.row}>
                  <View style={styles.rowLeft}>
                    <View style={styles.iconBox}>
                      <Wallet color={theme.colors.primary} size={16} />
                    </View>
                    <Text style={styles.rowName}>{label}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(c.id)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Trash2 color={theme.colors.textMuted} size={16} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgApp,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.textWhite,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.textMuted,
    fontSize: 12,
    paddingVertical: theme.spacing.lg,
  },
  listContainer: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  deleteButton: {
    padding: 6,
  },
});
