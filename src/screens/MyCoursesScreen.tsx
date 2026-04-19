import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { continueCourses } from '../data/dashboardMock';
import { colors, layout, radius, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

type TabId = 'progress' | 'completed' | 'pending';

export function MyCoursesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('progress');
  
  const list = continueCourses; 

  const renderTab = (id: TabId, label: string) => {
    const active = activeTab === id;
    return (
      <Pressable 
        style={[styles.tabBtn, active && styles.tabBtnActive]} 
        onPress={() => setActiveTab(id)}
      >
        <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.heroTitle}>Mis Cursos</Text>
        <Text style={styles.heroSub}>Bienvenido de nuevo</Text>
      </View>
      
      <View style={styles.tabsRow}>
         {renderTab('progress', 'En Progreso')}
         {renderTab('completed', 'Completados')}
         {renderTab('pending', 'Pendientes')}
      </View>

      <FlatList
        data={list}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <View style={styles.courseIcon}>
              <Ionicons name="book-outline" size={32} color={colors.primary} />
            </View>
            <View style={styles.courseBody}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              
              <View style={styles.iconRow}>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.courseMeta}>{item.schedule}</Text>
              </View>
              <View style={styles.iconRow}>
                <Ionicons name="person-outline" size={12} color={colors.textMuted} />
                <Text style={styles.courseMeta}>{item.facilitator}</Text>
              </View>
              
              <View style={styles.progressWrap}>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item.progressPct}%` }]} />
                  </View>
                  <Text style={styles.pct}>{item.progressPct}%</Text>
                </View>
                <Text style={styles.progressFoot}>{item.progressLabel}</Text>
              </View>
            </View>
          </View>
        )}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tabBtnActive: {
    backgroundColor: '#007BFF', // Azul vibrante del mockup (píldora)
    borderColor: '#007BFF',
  },
  tabTxt: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
  },
  tabTxtActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  courseIcon: {
    width: 50,
    marginTop: 4,
    alignItems: 'center',
  },
  courseBody: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  courseTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: '#041147',
    marginBottom: spacing.xs,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  courseMeta: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  progressWrap: {
    marginTop: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#EEF1F8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#041147',
    borderRadius: 4,
  },
  pct: {
    marginLeft: spacing.sm,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: '#041147',
    minWidth: 36,
  },
  progressFoot: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },
});
