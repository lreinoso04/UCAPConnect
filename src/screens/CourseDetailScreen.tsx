import { Linking, Pressable, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeStackParamList } from '../navigation/types';
import { resolveCourseCategoryLabel } from '../data/courseCategoryLabels';
import { colors, layout, radius, spacing, typography } from '../theme';
import { formatFechaInicio } from '../utils/courseDates';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'CourseDetail'>;

function str(acf: Record<string, unknown>, key: string): string | undefined {
  const v = acf[key];
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'object') return undefined;
  return String(v);
}

function bulletsFromContent(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean);
}

export function CourseDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isGuest, exitGuestToLogin } = useAuth();
  const { course } = route.params;
  const acf = course.acf || {};

  const category = resolveCourseCategoryLabel(course.acf);
  const fechaInicio =
    formatFechaInicio(acf['fecha_inicio'] ?? acf['fecha_de_inicio']) ?? undefined;
  const duracion = str(acf, 'duracion_horas');
  const horario = str(acf, 'hora');
  const recinto = str(acf, 'recinto');
  const modalidad = str(acf, 'modalidad');
  const facilitador = str(acf, 'nombre_coordinador');
  const objetivo = str(acf, 'objetivo');
  const dirigido = str(acf, 'dirigido_a');
  const inversion = str(acf, 'inversion');
  const contenidoRaw = str(acf, 'contenido_personalizado1');
  const bullets = bulletsFromContent(contenidoRaw);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={styles.backRow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={colors.textOnDark} />
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Text style={styles.heroCategory}>{category}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        <View style={styles.chipRow}>
          {fechaInicio ? (
            <View style={[styles.chip, styles.chipBlue]}>
              <Text style={styles.chipTxtBlue}>
                Inicia el {fechaInicio}
              </Text>
            </View>
          ) : null}
          <View style={[styles.chip, styles.chipOrange]}>
            <Text style={styles.chipTxt}>Cupos limitados</Text>
          </View>
        </View>
      </View>

      {course.imagen ? (
        <Image source={{ uri: course.imagen }} style={styles.heroImg} contentFit="cover" />
      ) : null}

      <View style={styles.pad}>
        {fechaInicio ? (
          <View style={styles.dateBanner}>
            <Ionicons name="calendar-outline" size={20} color={colors.heroNavy} />
            <View style={styles.dateBannerText}>
              <Text style={styles.dateBannerLabel}>Fecha de inicio</Text>
              <Text style={styles.dateBannerValue}>{fechaInicio}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Duración</Text>
            <Text style={styles.cellValue}>{duracion ? `${duracion} horas` : '—'}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Horario</Text>
            <Text style={styles.cellValue}>{horario ?? '—'}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Recinto</Text>
            <Text style={styles.cellValue}>{recinto ?? '—'}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Modalidad</Text>
            <Text style={styles.cellValue}>{modalidad ?? '—'}</Text>
          </View>
        </View>

        {facilitador ? (
          <View style={styles.facRow}>
            <Text style={styles.cellLabel}>Facilitador(a)</Text>
            <Text style={styles.cellValueSingle}>{facilitador}</Text>
          </View>
        ) : null}

        {objetivo ? (
          <View style={styles.block}>
            <Text style={styles.h2}>Objetivo</Text>
            <Text style={styles.body}>{objetivo}</Text>
          </View>
        ) : null}

        {dirigido ? (
          <View style={styles.block}>
            <Text style={styles.h2}>Dirigido a</Text>
            <View style={styles.dirigidoBox}>
              <Text style={styles.body}>{dirigido}</Text>
            </View>
          </View>
        ) : null}

        {bullets.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.h2}>Contenido del programa</Text>
            {bullets.map((line, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bodyFlex}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {inversion ? (
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Inversión total</Text>
            <Text style={styles.priceMain}>{inversion}</Text>
            <Text style={styles.priceSub}>Consulta facilidades de pago con admisiones.</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.btnPrimary}
          onPress={() => {
            if (isGuest) {
              Alert.alert('Registro requerido', 'Debes iniciar sesión para inscribirte.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Entrar', onPress: () => exitGuestToLogin() }
              ]);
            } else {
              navigation.navigate('CourseEnrollment', { course });
            }
          }}
        >
          <Text style={styles.btnPrimaryTxt}>Solicitar inscribirse</Text>
        </Pressable>

        <Pressable style={styles.btnOutline} onPress={() => Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSdbavZ2adm2ytkCtTU3qUd8zb2_kHLGKiunIFuSwYKCQFSYKA/viewform')}>
          <Text style={styles.btnOutlineTxt}>Más información</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1 },
  hero: {
    backgroundColor: colors.heroNavy,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textOnDark,
  },
  heroCategory: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
    lineHeight: 30,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  chipBlue: { backgroundColor: colors.chipBlueBg },
  chipOrange: { backgroundColor: colors.chipOrangeBg },
  chipTxt: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.textOnDark },
  /** Texto sobre chip azul claro: alto contraste */
  chipTxtBlue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.heroNavy,
    flexShrink: 1,
  },
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBannerText: { flex: 1 },
  dateBannerLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateBannerValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
  },
  heroImg: { width: '100%', height: 200, backgroundColor: colors.border },
  pad: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCell: {
    width: '48%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cellLabel: { fontSize: typography.size.xs, color: colors.textMuted, marginBottom: spacing.xs },
  cellValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.valueBlue },
  cellValueSingle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.valueBlue },
  facRow: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  block: { marginBottom: spacing.xl },
  h2: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: { fontSize: typography.size.md, color: colors.text, lineHeight: typography.lineHeight.relaxed, textAlign: 'justify' },
  dirigidoBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  bulletDot: { width: 20, fontSize: typography.size.md, color: colors.text },
  bodyFlex: { flex: 1, fontSize: typography.size.md, color: colors.text, lineHeight: typography.lineHeight.relaxed },
  priceCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  priceLabel: { fontSize: typography.size.sm, color: colors.text, fontWeight: typography.weight.semibold },
  priceMain: {
    marginTop: spacing.sm,
    fontSize: 32,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
  },
  priceSub: { marginTop: spacing.sm, fontSize: typography.size.sm, color: colors.textMuted, textAlign: 'center' },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  btnPrimaryTxt: {
    color: colors.textOnDark,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: colors.heroNavy,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  btnOutlineTxt: { color: colors.heroNavy, fontWeight: typography.weight.bold, fontSize: typography.size.body },
});
