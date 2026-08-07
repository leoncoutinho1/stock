import React, { useEffect, useState } from "react";
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
  Loader2,
  CheckCircle2,
} from "lucide-react";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
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

      if (savedEmail && savedPassword && savedDomain) {
        setHasSavedCredentials(true);
      }
    } catch (e) {
      console.error("Error loading saved auth state:", e);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl z-10 relative space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">VenderBem</h1>
          <p className="text-xs text-slate-400">Sistema de Estoque e PDV Mobile PWA</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@empresa.com"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Domínio / Tenant
            </label>
            <input
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="ex: minhaloja"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar no Sistema"}
          </button>
        </form>

        {/* Biometrics Login Button */}
        {isBiometricsAvailable && (
          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              onClick={handleBiometricAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Fingerprint className="w-4 h-4 text-blue-400" />
              Entrar com Biometria (TouchID / FaceID)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
