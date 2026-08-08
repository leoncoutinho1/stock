import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    bgApp:         'var(--color-bg-app)',
    bgCard:        'var(--color-bg-card)',
    bgElevated:    'var(--color-bg-elevated)',
    bgInput:       'var(--color-bg-input)',
    border:        'var(--color-border)',
    borderSubtle:  'var(--color-border-subtle)',

    primary:       'var(--color-primary)',
    primaryHover:  'var(--color-primary-hover)',
    primaryLight:  'var(--color-primary-light)',

    success:       'var(--color-success)',
    successLight:  'var(--color-success-light)',

    warning:       'var(--color-warning)',
    warningLight:  'var(--color-warning-light)',

    danger:        'var(--color-danger)',
    dangerLight:   'var(--color-danger-light)',

    textPrimary:   'var(--color-text-primary)',
    textSecondary: 'var(--color-text-secondary)',
    textMuted:     'var(--color-text-muted)',
    textWhite:     'var(--color-text-white)',
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
