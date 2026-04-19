import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../theme';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IonName;
  title: string;
  description: string;
};

/** Pestañas del diseño aún sin API: Mis cursos, Horario, Notas */
export function FeaturePlaceholderScreen({ icon, title, description }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isGuest = !user;
  const exitGuestToLogin = () => {};

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={40} color={colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
      <Text style={styles.hint}>Esta sección se conectará al backend cuando los endpoints estén disponibles.</Text>
      {isGuest ? (
        <Pressable style={styles.loginBtn} onPress={() => exitGuestToLogin()}>
          <Text style={styles.loginBtnText}>Iniciar sesión</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  desc: {
    fontSize: typography.size.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loginBtn: {
    marginTop: spacing.xxl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxxl,
    borderRadius: radius.pill,
  },
  loginBtnText: {
    color: colors.onPrimary,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.body,
  },
});
