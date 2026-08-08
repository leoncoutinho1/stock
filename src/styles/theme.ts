import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    bgApp: '#020617',          // slate-950
    bgCard: '#0f172a',         // slate-900
    bgElevated: '#1e293b',     // slate-800
    bgInput: '#1e293b',        // slate-800
    border: '#334155',         // slate-700
    borderSubtle: '#1e293b',   // slate-800
    
    primary: '#3b82f6',        // blue-500
    primaryHover: '#2563eb',   // blue-600
    primaryLight: 'rgba(59, 130, 246, 0.15)',
    
    success: '#10b981',        // emerald-500
    successLight: 'rgba(16, 185, 129, 0.15)',
    
    warning: '#f59e0b',        // amber-500
    warningLight: 'rgba(245, 158, 11, 0.15)',
    
    danger: '#ef4444',         // red-500
    dangerLight: 'rgba(239, 68, 68, 0.15)',

    textPrimary: '#f8fafc',    // slate-50
    textSecondary: '#94a3b8',  // slate-400
    textMuted: '#64748b',      // slate-500
    textWhite: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    titleLarge: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: '#f8fafc',
    },
    titleMedium: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#f8fafc',
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: '#f8fafc',
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#94a3b8',
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: '#64748b',
    },
  }
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgApp,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginVertical: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimaryText: {
    color: theme.colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonSecondaryText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  }
});
