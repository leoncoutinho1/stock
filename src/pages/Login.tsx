import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/src/api/auth";
import Storage from "@/src/services/storage";
import {
  isBiometricSupported,
  authenticateWithBiometrics,
  registerBiometricPasskey,
} from "@/src/services/biometrics";
import {
  Package,
  Lock,
  Mail,
  Globe,
  Fingerprint,
  Eye,
  EyeOff,
} from "lucide-react";
import { theme } from "@/src/styles/theme";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkSavedState();
  }, []);

  const checkSavedState = async () => {
    try {
      const supported = await isBiometricSupported();
      setIsBiometricsAvailable(supported);

      const savedEmail = await Storage.getItem("savedEmail");
      const savedPassword = await Storage.getItem("savedPassword");
      const savedDomain = await Storage.getItem("savedDomain");

      if (savedEmail) setEmail(savedEmail);
      if (savedDomain) setDomain(savedDomain);
      if (savedPassword) setPassword(savedPassword);
    } catch (e) {
      console.error("Error loading saved auth state:", e);
    }
  };

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email || !password || !domain) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.login(email, password, domain);
      if (result?.accessToken) {
        await Storage.setItem("savedEmail", email);
        await Storage.setItem("savedPassword", password);
        await Storage.setItem("savedDomain", domain);

        if (isBiometricsAvailable) {
          await registerBiometricPasskey(email);
        }

        navigate("/products");
      } else {
        setErrorMessage("Credenciais inválidas. Verifique os dados.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Falha ao realizar login. Conexão recusada.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const bioResult = await authenticateWithBiometrics(email);

      if (bioResult.success) {
        const savedEmail = await Storage.getItem("savedEmail");
        const savedPassword = await Storage.getItem("savedPassword");
        const savedDomain = await Storage.getItem("savedDomain");

        if (savedEmail && savedPassword && savedDomain) {
          const loginResult = await authApi.login(savedEmail, savedPassword, savedDomain);
          if (loginResult?.accessToken) {
            navigate("/products");
            return;
          }
        }
        setErrorMessage("Não há credenciais salvas para biometria. Faça o login com senha primeiro.");
      } else {
        setErrorMessage(bioResult.error || "Autenticação biométrica não concluída.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro na verificação biométrica.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.brandHeader}>
            <View style={styles.iconContainer}>
              <Package color={theme.colors.textWhite} size={32} />
            </View>
            <Text style={styles.brandTitle}>VenderBem</Text>
            <Text style={styles.brandSubtitle}>
              Sistema de Estoque e PDV React Native Web
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formGroup}>
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Mail color={theme.colors.primary} size={14} />
                <Text style={styles.label}>E-mail</Text>
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seuemail@empresa.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Globe color={theme.colors.primary} size={14} />
                <Text style={styles.label}>Domínio / Tenant</Text>
              </View>
              <TextInput
                value={domain}
                onChangeText={setDomain}
                placeholder="ex: minhaloja"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Lock color={theme.colors.primary} size={14} />
                <Text style={styles.label}>Senha</Text>
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff color={theme.colors.textSecondary} size={18} />
                  ) : (
                    <Eye color={theme.colors.textSecondary} size={18} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textWhite} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar no Sistema</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Biometrics */}
          {isBiometricsAvailable ? (
            <View style={styles.bioContainer}>
              <TouchableOpacity
                onPress={handleBiometricAuth}
                disabled={loading}
                style={styles.bioButton}
                activeOpacity={0.8}
              >
                <Fingerprint color={theme.colors.primary} size={18} />
                <Text style={styles.bioButtonText}>
                  Entrar com Biometria (TouchID / FaceID)
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgApp,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  formGroup: {
    gap: theme.spacing.lg,
  },
  inputContainer: {
    gap: theme.spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: theme.colors.textWhite,
    fontSize: 15,
    fontWeight: "700",
  },
  bioContainer: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  bioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  bioButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
