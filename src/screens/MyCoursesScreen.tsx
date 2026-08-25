import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from '../theme';

import MyCoursesService, {
  MyCourse,
} from '../services/MyCoursesService';

type TabId = 'progress' | 'completed' | 'pending';

export function MyCoursesScreen() {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabId>('progress');
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  /*
   * Recargar los cursos cada vez que la pantalla
   * vuelve a estar enfocada.
   */
  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [])
  );

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await MyCoursesService.getMyCourses();

      setCourses(data);
    } catch (err) {
      console.error('Error cargando mis cursos:', err);
      setError('No se pudieron cargar tus cursos.');
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByTab = () => {
    switch (activeTab) {
      case 'completed':
        return courses.filter(
          course => course.estado === 'COMPLETADO'
        );

      case 'pending':
        return courses.filter(
          course => course.estado === 'PENDIENTE'
        );

      case 'progress':
      default:
        return courses.filter(
          course => course.estado === 'EN_PROGRESO'
        );
    }
  };

  const list = getCoursesByTab();

  const renderTab = (id: TabId, label: string) => {
    const active = activeTab === id;

    return (
      <Pressable
        style={[
          styles.tabBtn,
          active && styles.tabBtnActive,
        ]}
        onPress={() => setActiveTab(id)}
      >
        <Text
          style={[
            styles.tabTxt,
            active && styles.tabTxtActive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>

      {/* HEADER */}
      <View
        style={[
          styles.hero,
          {
            paddingTop:
              insets.top + spacing.lg,
          },
        ]}
      >
        <Text style={styles.heroTitle}>
          Mis Cursos
        </Text>

        <Text style={styles.heroSub}>
          Bienvenido de nuevo
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabsRow}>
        {renderTab('progress', 'En Progreso')}
        {renderTab('completed', 'Completados')}
        {renderTab('pending', 'Pendientes')}
      </View>

      {/* LOADING */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Cargando tus cursos...
          </Text>
        </View>

      ) : error ? (

        /* ERROR */
        <View style={styles.center}>

          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={colors.textMuted}
          />

          <Text style={styles.errorText}>
            {error}
          </Text>

          <Pressable
            style={styles.retryBtn}
            onPress={loadCourses}
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </Pressable>

        </View>

      ) : (

        /* CURSOS */
        <FlatList
          data={list}
          keyExtractor={item =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}

          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                insets.bottom + 90,

              flexGrow:
                list.length === 0
                  ? 1
                  : undefined,
            },
          ]}

          ListEmptyComponent={
            <View style={styles.empty}>

              <Ionicons
                name="book-outline"
                size={48}
                color={colors.textMuted}
              />

              <Text style={styles.emptyTitle}>
                No tienes cursos aquí
              </Text>

              <Text style={styles.emptyText}>
                No encontramos cursos para esta categoría.
              </Text>

            </View>
          }

          renderItem={({ item }) => (

            <View style={styles.courseCard}>

              {/* ICONO */}
              <View style={styles.courseIcon}>
                <Ionicons
                  name="book-outline"
                  size={32}
                  color={colors.primary}
                />
              </View>

              {/* INFORMACIÓN */}
              <View style={styles.courseBody}>

                {/* NOMBRE */}
                <Text style={styles.courseTitle}>
                  {item.nombre}
                </Text>

                {/* HORARIO */}
                <View style={styles.iconRow}>

                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={colors.textMuted}
                  />

                  <Text style={styles.courseMeta}>
                    {item.horario ||
                      'Horario no disponible'}
                  </Text>

                </View>

                {/* FACILITADOR */}
                <View style={styles.iconRow}>

                  <Ionicons
                    name="person-outline"
                    size={12}
                    color={colors.textMuted}
                  />

                  <Text style={styles.courseMeta}>
                    {item.facilitador ||
                      'Sin asignar'}
                  </Text>

                </View>

                {/* DESCRIPCIÓN */}
                {item.descripcion ? (
                  <Text
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {item.descripcion}
                  </Text>
                ) : null}

                {/* ESTADO */}
                <View style={styles.statusContainer}>

                  <Text style={styles.statusLabel}>
                    Estado
                  </Text>

                  <View style={styles.statusBadge}>

                    <Text style={styles.statusText}>
                      {item.estado}
                    </Text>

                  </View>

                </View>

                {/* PROGRESO */}
                <View style={styles.progressWrap}>

                  <View style={styles.progressRow}>

                    {/* BARRA */}
                    <View style={styles.progressTrack}>

                      <View
                        style={[
                          styles.progressFill,
                          {
                            /*
                             * Valor por defecto:
                             * 0%
                             *
                             * Posteriormente el backend
                             * podrá enviar progressPct.
                             */
                            width: `${item.progressPct ?? 0}%`,
                          },
                        ]}
                      />

                    </View>

                    {/* PORCENTAJE */}
                    <Text style={styles.pct}>
                      {item.progressPct ?? 0}%
                    </Text>

                  </View>

                  {/* TEXTO DEL PROGRESO */}
                  <Text style={styles.progressFoot}>
                    {'Progreso del curso'}
                  </Text>

                </View>

              </View>

            </View>

          )}
        />

      )}

    </View>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  /* HEADER */

  hero: {
    backgroundColor: '#041147',
    paddingHorizontal:
      layout.screenPadding,
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

  /* TABS */

  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal:
      layout.screenPadding,
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
    backgroundColor: '#007BFF',
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

  /* LISTA */

  listContent: {
    paddingHorizontal:
      layout.screenPadding,
    paddingTop: spacing.md,
  },

  /* CARD */

  courseCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

  /* INFORMACIÓN */

  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  courseMeta: {
    flex: 1,
    marginLeft: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  description: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },

  /* ESTADO */

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  statusLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: '#EEF1F8',
  },

  statusText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: '#041147',
  },

  /* PROGRESO */

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

  /* LOADING */

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal:
      layout.screenPadding,
  },

  loadingText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },

  /* ERROR */

  errorText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.size.sm,
    textAlign: 'center',
  },

  retryBtn: {
    marginTop: spacing.md,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#007BFF',
    borderRadius: radius.pill,
  },

  retryText: {
    color: '#FFF',
    fontWeight: typography.weight.bold,
  },

  /* EMPTY */

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: '#041147',
  },

  emptyText: {
    marginTop: spacing.xs,
    textAlign: 'center',
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },

});