import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Props = {
  data: { label: string; value: number }[];
  title?: string;
};

/** Gráfico de barras simple (valores 0–1) alineado al estilo del dashboard */
export function WeeklyBarsChart({ data, title = 'Actividad semanal' }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {data.map((item, i) => {
          const h = Math.max(6, Math.round(item.value * 90));
          return (
            <View key={`${item.label}-${i}`} style={styles.col}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: h }]} />
              </View>
              <Text style={styles.lab}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  col: { flex: 1, alignItems: 'center', marginHorizontal: 2 },
  barTrack: {
    width: '100%',
    height: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  barFill: {
    width: '72%',
    backgroundColor: colors.accent,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  lab: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.textMuted,
    fontWeight: typography.weight.semibold,
  },
});
