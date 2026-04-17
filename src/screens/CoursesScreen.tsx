import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCourses } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ApiException } from '../api/client';
import type { HomeStackParamList } from '../navigation/types';
import type { CursoResponse } from '../types/api';
import { resolveCourseCategoryLabel } from '../data/courseCategoryLabels';
import { colors, layout, radius, spacing, typography } from '../theme';

const PER_PAGE = 10;

type Props = NativeStackScreenProps<HomeStackParamList, 'CoursesList'>;

function getCardGradients(id: number) {
  const palette = ['#f3858c', '#15838f', '#efb33f', '#52697b'];
  return palette[id % palette.length];
}

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
  const isGuest = !user;
  const { cartCount } = useCart();
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
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filterOptions = ['Todos', 'Diplomados', 'Seminarios', 'Cursos', 'Talleres'];

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
        const more = total != null ? pageNum * PER_PAGE < total : data.length >= PER_PAGE;
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

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>PROGRAMAS</Text>
            <Text style={styles.heroSub}>Cursos, Diplomados y Talleres</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {isGuest && (
              <Pressable 
                onPress={() => navigation.navigate('Login' as any)}
                style={{ backgroundColor: '#041147', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' }}>Acceder</Text>
              </Pressable>
            )}
            <Pressable style={styles.cartBtn} onPress={() => {
              if (isGuest) {
                Alert.alert('Registro requerido', 'Debes iniciar sesión para usar el carrito.', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Entrar', onPress: () => navigation.navigate('Login' as any) }
                ]);
              } else {
                navigation.navigate('Cart');
              }
            }}>
              <Ionicons name="cart-outline" size={28} color="#041147" />
              {cartCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountTxt}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cursos por título, tipo, modalidad, recinto o fecha..."
          placeholderTextColor={colors.textMuted}
          value={draftSearch}
          onChangeText={setDraftSearch}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map(f => (
            <Pressable 
              key={f} 
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterPillText, activeFilter === f && styles.filterPillTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing && list.length === 0 ? (
        <ActivityIndicator style={{ marginTop: spacing.xxl }} size="large" color={colors.primary} />
      ) : null}
      
      {error ? <Text style={styles.bannerError}>{error}</Text> : null}

      <FlatList
        data={list}
        keyExtractor={(item) => `${item.id}-${item.title}`}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        numColumns={1}
        renderItem={({ item }) => {
          const cat = resolveCourseCategoryLabel(item.acf);
          const recinto = item.acf?.recinto ? String(item.acf.recinto).trim() : 'N/A';
          const modalidad = item.acf?.modalidad ? String(item.acf.modalidad).trim() : 'Virtual';
          const fechaText = item.acf?.fecha_texto ?? item.acf?.fecha_inicio ?? 'Próximamente'; 
          const stripColor = getCardGradients(item.id);

          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('CourseDetail', { course: item })}
            >
              <View style={styles.cardCover}>
                {item.imagen ? (
                  <Image source={{ uri: item.imagen }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, styles.cardImagePh]} />
                )}
                {/* Gradient for text readability */}
                <View style={styles.gradientOverlay} />
                
                {recinto && recinto !== 'N/A' && (
                  <View style={styles.topBadge}>
                    <Text style={styles.topBadgeText}>{recinto}</Text>
                  </View>
                )}

                <View style={styles.cardTextContent}>
                  <Text style={styles.cardMeta}>{cat}</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                </View>
              </View>

              <View style={[styles.bottomStrip, { backgroundColor: stripColor }]}>
                <Text style={styles.stripText}>{`${modalidad} | ${fechaText}`}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No hay cursos para mostrar.</Text> : null
        }
        ListFooterComponent={
          list.length > 0 ? (
            <View style={styles.footer}>
              <View style={styles.pagination}>
                <Pressable
                  style={[styles.pageArrow, styles.pageArrowLeft, page <= 1 && styles.pageArrowDisabled]}
                  disabled={page <= 1 || pageLoading}
                  onPress={() => goToPage(page - 1)}
                >
                  <Text style={styles.pageNumTxt}>{'<'}</Text>
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
                    (totalCount != null ? page >= Math.ceil(totalCount / PER_PAGE) : !hasMore) && styles.pageArrowDisabled,
                  ]}
                  disabled={pageLoading || (totalCount != null ? page >= Math.ceil(totalCount / PER_PAGE) : !hasMore)}
                  onPress={() => goToPage(page + 1)}
                >
                  <Text style={styles.pageNumTxt}>{'>'}</Text>
                </Pressable>
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cartBtn: {
    padding: spacing.xs,
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF8300',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountTxt: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: '#041147',
    textTransform: 'uppercase',
  },
  heroSub: {
    marginTop: 4,
    fontSize: typography.size.md,
    color: '#FF8300',
    fontWeight: typography.weight.bold,
    marginBottom: spacing.lg,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterScroll: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: '#FF8300',
    borderColor: '#FF8300',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: '#FFF',
  },
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCover: {
    height: 240,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  cardImagePh: { backgroundColor: '#cfd8e8' },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: '#FF8300',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  topBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  cardTextContent: {
    padding: spacing.lg,
  },
  cardMeta: {
    color: '#FFFFFF',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: typography.weight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomStrip: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  stripText: {
    color: '#FFFFFF',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  footer: { marginTop: spacing.md, paddingBottom: spacing.lg },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  pageArrow: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pageArrowLeft: {},
  pageArrowRight: {},
  pageArrowDisabled: { opacity: 0.4 },
  pageNumBtn: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  pageNumBtnActive: { backgroundColor: '#041147' },
  pageNumBtnIdle: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pageNumTxt: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  pageNumTxtActive: { color: colors.textOnDark },
  pageNumTxtIdle: { color: colors.text },
  empty: { textAlign: 'center', marginTop: spacing.xxxl, color: colors.textMuted },
});
