import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCourses } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import { ApiException } from '../api/client';
import type { HomeStackParamList } from '../navigation/types';
import type { CursoResponse } from '../types/api';
import { resolveCourseCategoryLabel } from '../data/courseCategoryLabels';
import { colors, layout, radius, spacing, typography } from '../theme';

const PER_PAGE = 5;

type Props = NativeStackScreenProps<HomeStackParamList, 'CoursesList'>;

function metaLine1(item: CursoResponse): string {
  const acf = item.acf || {};
  const modal = acf.modalidad != null ? String(acf.modalidad).trim() : '';
  const rec = acf.recinto != null ? String(acf.recinto).trim() : '';
  if (modal && rec) return `${modal} - ${rec}`;
  if (modal) return modal;
  if (rec) return rec;
  return 'Consulta disponibilidad en el detalle';
}

function metaLine2(item: CursoResponse): string | null {
  const acf = item.acf || {};
  const hora = acf.hora != null ? String(acf.hora).trim() : '';
  return hora || null;
}

/** Números de página visibles (máx. 5) alineado al mockup del catálogo. */
function visiblePageNumbers(
  current: number,
  totalCount: number | null,
  perPage: number,
  hasMore: boolean
): number[] {
  const totalPages = totalCount != null ? Math.max(1, Math.ceil(totalCount / perPage)) : null;

  if (totalPages != null) {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const windowSize = 5;
    const start = Math.max(1, Math.min(current - 2, totalPages - windowSize + 1));
    return Array.from({ length: windowSize }, (_, i) => start + i);
  }

  if (current === 1 && !hasMore) return [1];
  const end = current + (hasMore ? 1 : 0);
  const start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function CoursesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [list, setList] = useState<CursoResponse[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const load = useCallback(
    async (pageNum: number, opts?: { initial?: boolean; searchOverride?: string }) => {
      const q = opts?.searchOverride !== undefined ? opts.searchOverride : search;
      const initial = opts?.initial ?? false;
      setError(null);
      if (initial) setLoading(true);
      else setPageLoading(true);
      try {
        const { courses: data, total } = await fetchCourses({
          page: pageNum,
          per_page: PER_PAGE,
          search: q || undefined,
          token: user?.token ?? null,
        });
        setList(data);
        setTotalCount(total);
        const more =
          total != null
            ? pageNum * PER_PAGE < total
            : data.length >= PER_PAGE;
        setHasMore(more);
      } catch (e) {
        const msg = e instanceof ApiException ? e.message : 'No se pudieron cargar los cursos';
        setError(msg);
        setList([]);
        setTotalCount(null);
      } finally {
        setLoading(false);
        setPageLoading(false);
        setRefreshing(false);
      }
    },
    [search, user?.token]
  );

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      load(1, { initial: true });
    }, [load])
  );

  function onRefresh() {
    setRefreshing(true);
    setPage(1);
    load(1, { initial: true });
  }

  function submitSearch() {
    const q = draftSearch.trim();
    setSearch(q);
    setPage(1);
    load(1, { initial: true, searchOverride: q });
  }

  function goToPage(next: number) {
    if (next < 1) return;
    if (totalCount != null) {
      const tp = Math.ceil(totalCount / PER_PAGE);
      if (next > tp) return;
    } else if (next > page && !hasMore) return;
    setPage(next);
    load(next, { initial: false });
  }

  const pageNumbers = useMemo(
    () => visiblePageNumbers(page, totalCount, PER_PAGE, hasMore),
    [page, totalCount, hasMore]
  );

  const rangeLabel = useMemo(() => {
    if (list.length === 0) return null;
    const from = (page - 1) * PER_PAGE + 1;
    const to = (page - 1) * PER_PAGE + list.length;
    if (totalCount != null) {
      return `Mostrando ${from}–${to} de ${totalCount} capacitación${totalCount !== 1 ? 'es' : ''}`;
    }
    return `Mostrando ${list.length} en esta página${search ? ` · “${search}”` : ''}`;
  }, [list.length, page, totalCount, search]);

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.heroTitle}>Programas</Text>
        <Text style={styles.heroSub}>Cursos, Diplomados y Talleres</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busca capacitaciones…"
            placeholderTextColor={colors.textMuted}
            value={draftSearch}
            onChangeText={setDraftSearch}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
          />
        </View>
        <Pressable
          style={styles.filterBtn}
          onPress={() => Alert.alert('Filtros', 'Los filtros avanzados se habilitarán en una próxima versión.')}
        >
          <Ionicons name="options-outline" size={20} color={colors.onPrimary} />
          <Text style={styles.filterBtnText}>Filtros</Text>
          <Ionicons name="chevron-down" size={18} color={colors.onPrimary} style={styles.filterChevron} />
        </Pressable>
      </View>

      {loading && !refreshing && list.length === 0 ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} size="large" color={colors.primary} />
      ) : null}
      {error ? <Text style={styles.bannerError}>{error}</Text> : null}

      <FlatList
        data={list}
        keyExtractor={(item) => `${item.id}-${item.title}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          list.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.pagination}>
                <Pressable
                  style={[styles.pageArrow, styles.pageArrowLeft, page <= 1 && styles.pageArrowDisabled]}
                  disabled={page <= 1 || pageLoading}
                  onPress={() => goToPage(page - 1)}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={page <= 1 ? colors.textMuted : colors.textMuted}
                  />
                </Pressable>
                {pageNumbers.map((p) => (
                  <Pressable
                    key={p}
                    style={[styles.pageNumBtn, p === page ? styles.pageNumBtnActive : styles.pageNumBtnIdle]}
                    disabled={pageLoading || p === page}
                    onPress={() => goToPage(p)}
                  >
                    <Text style={[styles.pageNumTxt, p === page ? styles.pageNumTxtActive : styles.pageNumTxtIdle]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={[
                    styles.pageArrow,
                    styles.pageArrowRight,
                    (totalCount != null
                      ? page >= Math.ceil(totalCount / PER_PAGE)
                      : !hasMore) && styles.pageArrowDisabled,
                  ]}
                  disabled={
                    pageLoading ||
                    (totalCount != null ? page >= Math.ceil(totalCount / PER_PAGE) : !hasMore)
                  }
                  onPress={() => goToPage(page + 1)}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={
                      totalCount != null
                        ? page >= Math.ceil(totalCount / PER_PAGE)
                          ? colors.border
                          : colors.primary
                        : !hasMore
                          ? colors.border
                          : colors.primary
                    }
                  />
                </Pressable>
              </View>
              {pageLoading ? (
                <ActivityIndicator style={{ marginTop: spacing.sm }} color={colors.primary} />
              ) : null}
              {rangeLabel ? <Text style={styles.countLineFooter}>{rangeLabel}</Text> : null}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No hay cursos para mostrar.</Text> : null
        }
        ListHeaderComponent={
          list.length > 0 ? (
            <Text style={styles.countLine}>
              Resultados · toca una tarjeta para ver el detalle
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetail', { course: item })}
          >
            <View style={styles.cardImageWrap}>
              {item.imagen ? (
                <Image source={{ uri: item.imagen }} style={styles.cardImage} contentFit="cover" />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePh]} />
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {resolveCourseCategoryLabel(item.acf)}
                </Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardMeta}>{metaLine1(item)}</Text>
              {metaLine2(item) ? <Text style={styles.cardMetaSecondary}>{metaLine2(item)}</Text> : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
  },
  heroSub: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.88)',
    marginBottom: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputFill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: typography.size.body,
    color: colors.text,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.interactiveBlue,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  filterBtnText: {
    color: colors.onPrimary,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.md,
    marginHorizontal: spacing.sm,
  },
  filterChevron: { marginLeft: spacing.xs },
  bannerError: {
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#ffebee',
    color: colors.error,
    borderRadius: radius.sm,
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  countLine: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  footer: { marginTop: spacing.md, paddingBottom: spacing.lg },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pageArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageArrowLeft: {
    backgroundColor: '#E8EAEF',
  },
  pageArrowRight: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageArrowDisabled: {
    opacity: 0.45,
  },
  pageNumBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumBtnActive: {
    backgroundColor: colors.primary,
  },
  pageNumBtnIdle: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageNumTxt: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  pageNumTxtActive: { color: colors.textOnDark },
  pageNumTxtIdle: { color: colors.primary },
  countLineFooter: {
    marginTop: spacing.md,
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 160, backgroundColor: colors.border },
  cardImagePh: { backgroundColor: '#cfd8e8' },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accentYellow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.sm,
    maxWidth: '75%',
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  cardBody: { padding: spacing.md },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  cardMeta: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  cardMetaSecondary: {
    marginTop: 4,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  empty: { textAlign: 'center', marginTop: spacing.xxxl, color: colors.textMuted },
});
