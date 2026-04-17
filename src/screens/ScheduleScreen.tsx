import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { upcomingEvents } from '../data/dashboardMock';
import { colors, layout, radius, spacing, typography } from '../theme';

const daysOfWeek = [
  { day: 'Lun', date: '16', active: false },
  { day: 'Mar', date: '17', active: false },
  { day: 'Mié', date: '18', active: true },
  { day: 'Jue', date: '19', active: false },
  { day: 'Vie', date: '20', active: false },
  { day: 'Sáb', date: '21', active: false },
  { day: 'Dom', date: '22', active: false },
];

export function ScheduleScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.heroTitle}>Horarios</Text>
        <Text style={styles.heroSub}>Semana del 16 al 22 marzo 2026</Text>
      </View>

      <View style={styles.calendarStrip}>
        {daysOfWeek.map((d, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={styles.dayLabel}>{d.day}</Text>
            <View style={[styles.dateCircle, d.active && styles.dateCircleActive]}>
              <Text style={[styles.dateLabel, d.active && styles.dateLabelActive]}>{d.date}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.statusPill}>
        <Text style={styles.statusText}>Hoy, Miércoles 18 de Marzo — Sin clases programadas</Text>
      </View>

      <Text style={styles.sectionTitle}>Próximas actividades</Text>

      <FlatList
        data={upcomingEvents}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <View style={styles.eventLeft}>
              <Text style={styles.eventDay}>{item.day}</Text>
              <Text style={styles.eventMonth}>{item.month}</Text>
              <Text style={styles.eventTime}>{item.timeRange}</Text>
            </View>
            <View style={styles.eventRight}>
              <Text style={styles.eventTag}>{item.tag}</Text>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventFac}>Facilitador: {item.facilitator}</Text>
              <Text style={[styles.eventLoc, { color: item.locationLine === 'Virtual' ? '#007BFF' : '#28A745' }]}>
                {item.locationLine}
              </Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <Pressable style={styles.exportBtn}>
            <Text style={styles.exportText}>Exportar a Google Calendar</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: {
    backgroundColor: '#041147',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: '#FFF',
  },
  heroSub: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayCol: {
    alignItems: 'center',
    width: 40,
  },
  dayLabel: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: typography.weight.medium,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleActive: {
    backgroundColor: '#041147',
  },
  dateLabel: {
    fontSize: typography.size.md,
    color: colors.text,
    fontWeight: typography.weight.semibold,
  },
  dateLabelActive: {
    color: '#FFF',
  },
  statusPill: {
    backgroundColor: '#EEF1F8',
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.size.xs,
    color: '#041147',
    fontWeight: typography.weight.medium,
  },
  sectionTitle: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: '#041147',
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  eventLeft: {
    width: 70,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.sm,
    marginRight: spacing.sm,
  },
  eventDay: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: '#041147',
  },
  eventMonth: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: '#041147',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 10,
    color: '#FF8300',
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  eventRight: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTag: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: '#041147',
    marginBottom: 4,
  },
  eventFac: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  eventLoc: {
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },
  exportBtn: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#041147',
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportText: {
    color: '#041147',
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});
