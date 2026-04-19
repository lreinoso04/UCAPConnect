import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WeeklyBarsChart } from '../components/WeeklyBarsChart';
import {
  continueCourses,
  dashboardStats,
  promoBanner,
  upcomingEvents,
  weeklyActivity,
} from '../data/dashboardMock';
import { useAuth } from '../context/AuthContext';
import type { HomeStackParamList } from '../navigation/types';
import {
  getDashboardQuickItems,
  getDashboardSubtitle,
  getSegmentDisplayName,
  resolveSegment,
} from '../roles/segmentConfig';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isGuest = !user;
  const segment = resolveSegment(isGuest, user?.rol);
  const displayName = user?.username ?? 'Invitado';
  const quickItems = getDashboardQuickItems(segment);

  function goTab(name: 'MyCoursesTab' | 'ScheduleTab' | 'GradesTab') {
    const parent = navigation.getParent();
    parent?.navigate(name);
  }

  function onQuickAction(nav: (typeof quickItems)[number]['nav']) {
    if (nav === 'courses') {
      navigation.navigate('CoursesList');
      return;
    }
    if (nav === 'myCourses') goTab('MyCoursesTab');
    if (nav === 'schedule') goTab('ScheduleTab');
    if (nav === 'grades') {
      Alert.alert('Próximamente', 'Esta opción estará disponible en una próxima versión.');
      return;
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <Text style={styles.greeting}>¡Hola {displayName}!</Text>
            <Text style={styles.welcomeSub}>{getDashboardSubtitle(segment)}</Text>
            <Text style={styles.segmentPill}>Perfil: {getSegmentDisplayName(segment)}</Text>
          </View>
          <Pressable
            style={styles.bell}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textOnDark} />
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>3</Text>
            </View>
          </Pressable>
        </View>

        {isGuest ? (
          <View style={styles.demoBanner}>
            <Text style={styles.demoTxt}>Modo demostración · Inicia sesión para datos reales</Text>
          </View>
        ) : null}

        {!isGuest && segment === 'estudiante' ? (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{dashboardStats.activeCourses}</Text>
              <Text style={styles.statLabel}>Cursos activos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{dashboardStats.average}</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{dashboardStats.certificates}</Text>
              <Text style={styles.statLabel}>Certificados</Text>
            </View>
          </View>
        ) : !isGuest && (segment === 'docente' || segment === 'admin') ? (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>—</Text>
              <Text style={styles.statLabel}>Grupos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>—</Text>
              <Text style={styles.statLabel}>Sesiones</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>—</Text>
              <Text style={styles.statLabel}>Reportes</Text>
            </View>
          </View>
        ) : isGuest ? (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>∞</Text>
              <Text style={styles.statLabel}>Catálogo</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>•</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>@</Text>
              <Text style={styles.statLabel}>Contacto</Text>
            </View>
          </View>
        ) : segment === 'empresa' ? (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>—</Text>
              <Text style={styles.statLabel}>Programas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>—</Text>
              <Text style={styles.statLabel}>Solicitudes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>—</Text>
              <Text style={styles.statLabel}>Indicadores</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickRow}>
          {quickItems.map((q) => (
            <Pressable key={q.key} style={styles.quickItem} onPress={() => onQuickAction(q.nav)}>
              <View style={[styles.quickCircle, { backgroundColor: q.bg }]}>
                <Ionicons name={q.icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={styles.promo}
          onPress={() => navigation.navigate('CoursesList')}
        >
          <Text style={styles.promoTitle}>{promoBanner.title}</Text>
          <Text style={styles.promoSub}>{promoBanner.subtitle}</Text>
          <View style={styles.promoBtn}>
            <Text style={styles.promoBtnText}>Ver más</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <WeeklyBarsChart data={weeklyActivity} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isGuest ? 'Explora el catálogo' : segment === 'docente' || segment === 'admin' ? 'Actividad reciente' : 'Continúa donde lo dejaste'}
        </Text>
        {isGuest ? (
          <Pressable style={styles.courseCard} onPress={() => navigation.navigate('CoursesList')}>
            <View style={styles.courseIcon}>
              <Ionicons name="school-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.courseBody}>
              <Text style={styles.courseTitle}>Ver programas disponibles</Text>
              <Text style={styles.courseMeta}>Cursos, diplomados y talleres. Sin cuenta puedes consultar la oferta.</Text>
            </View>
          </Pressable>
        ) : (
        continueCourses.map((c) => (
          <View key={c.id} style={styles.courseCard}>
            <View style={styles.courseIcon}>
              <Ionicons name="book-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.courseBody}>
              <Text style={styles.courseTitle}>{c.title}</Text>
              <Text style={styles.courseMeta}>{c.schedule}</Text>
              <Text style={styles.courseMeta}>{c.facilitator}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${c.progressPct}%` }]} />
                </View>
                <Text style={styles.pct}>{c.progressPct}%</Text>
              </View>
              <Text style={styles.progressFoot}>{c.progressLabel}</Text>
            </View>
          </View>
        ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos eventos</Text>
        {upcomingEvents.map((ev) => (
          <View key={ev.id} style={styles.eventCard}>
            <View style={styles.eventLeft}>
              <Text style={styles.eventDay}>{ev.day}</Text>
              <Text style={styles.eventMonth}>{ev.month}</Text>
              <Text style={styles.eventTime}>{ev.timeRange}</Text>
            </View>
            <View style={styles.eventRight}>
              <Text style={styles.eventTag}>{ev.tag}</Text>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              <Text style={styles.eventFac}>{ev.facilitator}</Text>
              <Text style={styles.eventLoc}>{ev.locationLine}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { flexGrow: 1 },
  hero: {
    backgroundColor: colors.heroNavy,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroText: { flex: 1, paddingRight: spacing.md },
  greeting: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
  },
  welcomeSub: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  segmentPill: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.95)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  bell: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTxt: { color: colors.textOnDark, fontSize: 10, fontWeight: typography.weight.bold },
  demoBanner: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  demoTxt: { color: 'rgba(255,255,255,0.95)', fontSize: typography.size.xs, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statNum: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: { paddingHorizontal: layout.screenPadding, marginTop: spacing.lg },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickItem: { alignItems: 'center', width: '22%' },
  quickCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: typography.weight.semibold,
  },
  promo: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
    textAlign: 'center',
  },
  promoSub: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },
  promoBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.heroNavy,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  promoBtnText: {
    color: colors.textOnDark,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  courseIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  courseBody: { flex: 1 },
  courseTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
  },
  courseMeta: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.surface,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.heroNavy, borderRadius: 5 },
  pct: {
    marginLeft: spacing.sm,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
    minWidth: 40,
  },
  progressFoot: {
    marginTop: spacing.sm,
    fontSize: typography.size.xs,
    color: colors.textMuted,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  eventLeft: { width: 76, marginRight: spacing.md, alignItems: 'flex-start' },
  eventDay: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
    lineHeight: 32,
  },
  eventMonth: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  eventTime: { fontSize: typography.size.xs, color: colors.accent, fontWeight: typography.weight.bold },
  eventRight: { flex: 1 },
  eventTag: { fontSize: typography.size.xs, color: colors.textMuted },
  eventTitle: {
    marginTop: spacing.xs,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
  },
  eventFac: { marginTop: spacing.xs, fontSize: typography.size.sm, color: colors.textMuted },
  eventLoc: { marginTop: spacing.xs, fontSize: typography.size.xs, color: colors.link },
});
