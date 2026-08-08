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
import { categoryApi } from "@/src/api/category";
import { Tag, Plus, Trash2 } from "lucide-react";
import { theme } from "@/src/styles/theme";

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategories();
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setCategories(list);
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await categoryApi.createCategory({ description: name.trim(), name: name.trim() });
      setName("");
      loadCategories();
    } catch (e) {
      window.alert("Erro ao salvar categoria.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!window.confirm("Excluir esta categoria?")) return;
    try {
      await categoryApi.deleteCategory(id);
      loadCategories();
    } catch (e) {
      window.alert("Erro ao excluir categoria.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Create form */}
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Tag color="#c084fc" size={16} />
          <Text style={styles.cardTitle}>Nova Categoria</Text>
        </View>

        <View style={styles.formRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Descrição / Nome da categoria (ex: Bebidas, Roupas...)"
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

      {/* List */}
      <View style={styles.card}>
        <Text style={styles.sectionHeaderTitle}>Categorias Cadastradas</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma categoria cadastrada.</Text>
        ) : (
          <View style={styles.listContainer}>
            {categories.map((cat) => {
              const label = cat.description || cat.name || cat.title || `Categoria #${cat.id}`;
              return (
                <View key={cat.id} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={styles.iconBox}>
                      <Tag color="#c084fc" size={16} />
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{label}</Text>
                      {cat.createdAt ? (
                        <Text style={styles.categoryDate}>
                          {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(cat.id)}
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
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  categoryDate: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  deleteButton: {
    padding: 6,
  },
});
