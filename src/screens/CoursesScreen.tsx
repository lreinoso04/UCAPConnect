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
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';

import { fetchCourses } from '../api/courses';
import { useAuth } from '../context/AuthContext';
import { ApiException } from '../api/client';
import type { HomeStackParamList } from '../navigation/types';
import type { CursoResponse } from '../types/api';
import { resolveCourseCategoryLabel } from '../data/courseCategoryLabels';
import {
  colors,
  layout,
  radius,
  spacing,
  typography,
} from '../theme';

const PER_PAGE = 10;

type Props = NativeStackScreenProps<
  HomeStackParamList,
  'CoursesList'
>;

function getCardGradients(id: number) {
  const palette = [
    '#f3858c',
    '#15838f',
    '#efb33f',
    '#52697b',
  ];

  return palette[id % palette.length];
}

function visiblePageNumbers(
  current: number,
  totalCount: number | null,
  perPage: number,
  hasMore: boolean
): number[] {
  const totalPages =
    totalCount != null
      ? Math.max(
          1,
          Math.ceil(totalCount / perPage)
        )
      : null;

  if (totalPages != null) {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    const windowSize = 5;

    const start = Math.max(
      1,
      Math.min(
        current - 2,
        totalPages - windowSize + 1
      )
    );

    return Array.from(
      { length: windowSize },
      (_, i) => start + i
    );
  }

  if (current === 1 && !hasMore) {
    return [1];
  }

  const end = current + (hasMore ? 1 : 0);
  const start = Math.max(1, end - 4);

  return Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  );
}

export function CoursesScreen({
  navigation,
}: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isGuest = !user;

  const [list, setList] = useState<
    CursoResponse[]
  >([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [pageLoading, setPageLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [draftSearch, setDraftSearch] =
    useState('');

  const [error, setError] =
    useState<string | null>(null);

  const [totalCount, setTotalCount] =
    useState<number | null>(null);

  // Filtros
  const [showFilters, setShowFilters] =
    useState(false);

  const [activeRecinto, setActiveRecinto] =
    useState('Todos');

  const [activeModalidad, setActiveModalidad] =
    useState('Todas');

  const [failedImages, setFailedImages] =
    useState<Set<number>>(new Set());

  /**
   * Obtiene los recintos disponibles
   * entre los cursos cargados.
   */
  const recintos = useMemo(() => {
    const values = list
      .map(item => item.acf?.recinto)
      .filter(Boolean)
      .map(value =>
        String(value).trim()
      )
      .filter(Boolean);

    return [
      'Todos',
      ...Array.from(new Set(values)),
    ];
  }, [list]);

  /**
   * Obtiene las modalidades disponibles
   * entre los cursos cargados.
   */
  const modalidades = useMemo(() => {
    const values = list
      .map(item => item.acf?.modalidad)
      .filter(Boolean)
      .map(value =>
        String(value).trim()
      )
      .filter(Boolean);

    return [
      'Todas',
      ...Array.from(new Set(values)),
    ];
  }, [list]);

  /**
   * Filtra los cursos por recinto y modalidad.
   */
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const recinto = item.acf?.recinto
        ? String(
            item.acf.recinto
          ).trim()
        : '';

      const modalidad =
        item.acf?.modalidad
          ? String(
              item.acf.modalidad
            ).trim()
          : '';

      const matchesRecinto =
        activeRecinto === 'Todos' ||
        recinto === activeRecinto;

      const matchesModalidad =
        activeModalidad === 'Todas' ||
        modalidad === activeModalidad;

      return (
        matchesRecinto &&
        matchesModalidad
      );
    });
  }, [
    list,
    activeRecinto,
    activeModalidad,
  ]);

  const hasActiveFilters =
    activeRecinto !== 'Todos' ||
    activeModalidad !== 'Todas';

  const activeFilterCount =
    Number(activeRecinto !== 'Todos') +
    Number(
      activeModalidad !== 'Todas'
    );

  const load = useCallback(
    async (
      pageNum: number,
      opts?: {
        initial?: boolean;
        searchOverride?: string;
      }
    ) => {
      const q =
        opts?.searchOverride !== undefined
          ? opts.searchOverride
          : search;

      const initial =
        opts?.initial ?? false;

      setError(null);

      if (initial) {
        setLoading(true);
      } else {
        setPageLoading(true);
      }

      try {
        const {
          courses: data,
          total,
        } = await fetchCourses({
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
        const msg =
          e instanceof ApiException
            ? e.message
            : 'No se pudieron cargar los cursos';

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
      load(1, {
        initial: true,
      });
    }, [load])
  );

  function onRefresh() {
    setRefreshing(true);
    setPage(1);

    load(1, {
      initial: true,
    });
  }

  function submitSearch() {
    const q =
      draftSearch.trim();

    setSearch(q);
    setPage(1);

    load(1, {
      initial: true,
      searchOverride: q,
    });
  }

  function goToPage(next: number) {
    if (next < 1) return;

    if (totalCount != null) {
      const totalPages =
        Math.ceil(
          totalCount / PER_PAGE
        );

      if (next > totalPages) {
        return;
      }
    } else if (
      next > page &&
      !hasMore
    ) {
      return;
    }

    setPage(next);

    load(next, {
      initial: false,
    });
  }

  function clearFilters() {
    setActiveRecinto('Todos');
    setActiveModalidad('Todas');
  }

  const pageNumbers = useMemo(
    () =>
      visiblePageNumbers(
        page,
        totalCount,
        PER_PAGE,
        hasMore
      ),
    [
      page,
      totalCount,
      hasMore,
    ]
  );

  const totalPages =
    totalCount != null
      ? Math.ceil(
          totalCount / PER_PAGE
        )
      : null;

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View
        style={[
          styles.hero,
          {
            paddingTop:
              insets.top +
              spacing.lg,
          },
        ]}
      >
        <View
          style={styles.heroTopRow}
        >
          <View
            style={{ flex: 1 }}
          >
            <Text
              style={styles.heroTitle}
            >
              PROGRAMAS
            </Text>

            <Text
              style={styles.heroSub}
            >
              Cursos, Diplomados y
              Talleres
            </Text>
          </View>

          {isGuest && (
            <Pressable
              onPress={() =>
                navigation.navigate(
                  'Login' as any
                )
              }
              style={
                styles.loginButton
              }
            >
              <Text
                style={
                  styles.loginButtonText
                }
              >
                Acceder
              </Text>
            </Pressable>
          )}
        </View>

        {/* BUSCADOR */}
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre"
          placeholderTextColor={
            colors.textMuted
          }
          value={draftSearch}
          onChangeText={
            setDraftSearch
          }
          onSubmitEditing={
            submitSearch
          }
          returnKeyType="search"
        />

        {/* BOTÓN DE FILTROS */}
        <Pressable
          style={[
            styles.filterButton,
            showFilters &&
              styles.filterButtonOpen,
          ]}
          onPress={() =>
            setShowFilters(
              prev => !prev
            )
          }
        >
          <View
            style={
              styles.filterButtonLeft
            }
          >
            <SlidersHorizontal
              size={18}
              color="#041147"
            />

            <Text
              style={
                styles.filterButtonText
              }
            >
              Filtros
            </Text>

            {hasActiveFilters && (
              <View
                style={
                  styles.filterCount
                }
              >
                <Text
                  style={
                    styles.filterCountText
                  }
                >
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </View>

          {showFilters ? (
            <ChevronUp
              size={18}
              color="#041147"
            />
          ) : (
            <ChevronDown
              size={18}
              color="#041147"
            />
          )}
        </Pressable>

        {/* PANEL DESPLEGABLE */}
        {showFilters && (
          <View
            style={
              styles.filterPanel
            }
          >
            {/* RECINTO */}
            <View
              style={
                styles.filterHeader
              }
            >
              <Text
                style={
                  styles.filterLabel
                }
              >
                Recinto
              </Text>

              {activeRecinto !==
                'Todos' && (
                <Pressable
                  onPress={() =>
                    setActiveRecinto(
                      'Todos'
                    )
                  }
                >
                  <Text
                    style={
                      styles.resetFilterText
                    }
                  >
                    Restablecer
                  </Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterScroll
              }
            >
              {recintos.map(
                recinto => (
                  <Pressable
                    key={recinto}
                    style={[
                      styles.filterPill,
                      activeRecinto ===
                        recinto &&
                        styles.filterPillActive,
                    ]}
                    onPress={() =>
                      setActiveRecinto(
                        recinto
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        activeRecinto ===
                          recinto &&
                          styles.filterPillTextActive,
                      ]}
                    >
                      {recinto}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>

            {/* MODALIDAD */}
            <View
              style={[
                styles.filterHeader,
                {
                  marginTop:
                    spacing.md,
                },
              ]}
            >
              <Text
                style={
                  styles.filterLabel
                }
              >
                Modalidad
              </Text>

              {activeModalidad !==
                'Todas' && (
                <Pressable
                  onPress={() =>
                    setActiveModalidad(
                      'Todas'
                    )
                  }
                >
                  <Text
                    style={
                      styles.resetFilterText
                    }
                  >
                    Restablecer
                  </Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterScroll
              }
            >
              {modalidades.map(
                modalidad => (
                  <Pressable
                    key={modalidad}
                    style={[
                      styles.filterPill,
                      activeModalidad ===
                        modalidad &&
                        styles.filterPillActive,
                    ]}
                    onPress={() =>
                      setActiveModalidad(
                        modalidad
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        activeModalidad ===
                          modalidad &&
                          styles.filterPillTextActive,
                      ]}
                    >
                      {modalidad}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>

            {/* LIMPIAR */}
            {hasActiveFilters && (
              <Pressable
                style={
                  styles.clearFiltersButton
                }
                onPress={
                  clearFilters
                }
              >
                <X
                  size={15}
                  color="#FF8300"
                />

                <Text
                  style={
                    styles.clearFiltersText
                  }
                >
                  Limpiar filtros
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* LOADING */}
      {loading &&
      !refreshing &&
      list.length === 0 ? (
        <ActivityIndicator
          style={{
            marginTop:
              spacing.xxl,
          }}
          size="large"
          color={
            colors.primary
          }
        />
      ) : null}

      {/* ERROR */}
      {error ? (
        <Text
          style={
            styles.bannerError
          }
        >
          {error}
        </Text>
      ) : null}

      {/* LISTADO */}
      <FlatList
        data={filteredList}
        keyExtractor={item =>
          `${item.id}-${item.title}`
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />
        }
        contentContainerStyle={
          styles.listContent
        }
        numColumns={1}
        renderItem={({
          item,
        }) => {
          const cat =
            resolveCourseCategoryLabel(
              item.acf
            );

          const recinto =
            item.acf?.recinto
              ? String(
                  item.acf.recinto
                ).trim()
              : 'N/A';

          const modalidad =
            item.acf?.modalidad
              ? String(
                  item.acf.modalidad
                ).trim()
              : 'Virtual';

          const fechaText =
            item.acf?.fecha_texto ??
            item.acf?.fecha_inicio ??
            'Próximamente';

          const stripColor =
            getCardGradients(
              item.id
            );

          return (
            <Pressable
              style={
                styles.card
              }
              onPress={() =>
                navigation.navigate(
                  'CourseDetail',
                  {
                    course:
                      item,
                  }
                )
              }
            >
              <View
                style={
                  styles.cardCover
                }
              >
                {item.imagen &&
                !failedImages.has(
                  item.id
                ) ? (
                  <Image
                    source={{
                      uri: String(
                        item.imagen
                      ).trim(),
                    }}
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        width:
                          '100%',
                        height:
                          '100%',
                      },
                    ]}
                    resizeMode="cover"
                    onError={() =>
                      setFailedImages(
                        prev =>
                          new Set(
                            prev
                          ).add(
                            item.id
                          )
                      )
                    }
                  />
                ) : (
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      styles.cardImagePh,
                    ]}
                  />
                )}

                <View
                  style={
                    styles.gradientOverlay
                  }
                />

                {recinto &&
                  recinto !==
                    'N/A' && (
                    <View
                      style={
                        styles.topBadge
                      }
                    >
                      <Text
                        style={
                          styles.topBadgeText
                        }
                      >
                        {recinto}
                      </Text>
                    </View>
                  )}

                <View
                  style={
                    styles.cardTextContent
                  }
                >
                  <Text
                    style={
                      styles.cardMeta
                    }
                  >
                    {cat}
                  </Text>

                  <Text
                    style={
                      styles.cardTitle
                    }
                    numberOfLines={
                      2
                    }
                  >
                    {item.title}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.bottomStrip,
                  {
                    backgroundColor:
                      stripColor,
                  },
                ]}
              >
                <Text
                  style={
                    styles.stripText
                  }
                >
                  {`${modalidad} | ${fechaText}`}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text
              style={
                styles.empty
              }
            >
              {list.length > 0
                ? 'No hay cursos que coincidan con los filtros.'
                : 'No hay cursos para mostrar.'}
            </Text>
          ) : null
        }
        ListFooterComponent={
          filteredList.length >
          0 ? (
            <View
              style={
                styles.footer
              }
            >
              <View
                style={
                  styles.pagination
                }
              >
                {/* ANTERIOR */}
                <Pressable
                  style={[
                    styles.pageArrow,
                    page <= 1 &&
                      styles.pageArrowDisabled,
                  ]}
                  disabled={
                    page <= 1 ||
                    pageLoading
                  }
                  onPress={() =>
                    goToPage(
                      page - 1
                    )
                  }
                >
                  <Text
                    style={
                      styles.pageNumTxt
                    }
                  >
                    {'<'}
                  </Text>
                </Pressable>

                {/* PÁGINAS */}
                {pageNumbers.map(
                  p => (
                    <Pressable
                      key={p}
                      style={[
                        styles.pageNumBtn,
                        p ===
                          page
                          ? styles.pageNumBtnActive
                          : styles.pageNumBtnIdle,
                      ]}
                      disabled={
                        pageLoading ||
                        p === page
                      }
                      onPress={() =>
                        goToPage(
                          p
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.pageNumTxt,
                          p ===
                            page
                            ? styles.pageNumTxtActive
                            : styles.pageNumTxtIdle,
                        ]}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  )
                )}

                {/* SIGUIENTE */}
                <Pressable
                  style={[
                    styles.pageArrow,
                    (
                      totalPages !=
                      null
                        ? page >=
                          totalPages
                        : !hasMore
                    ) &&
                      styles.pageArrowDisabled,
                  ]}
                  disabled={
                    pageLoading ||
                    (
                      totalPages !=
                      null
                        ? page >=
                          totalPages
                        : !hasMore
                    )
                  }
                  onPress={() =>
                    goToPage(
                      page + 1
                    )
                  }
                >
                  <Text
                    style={
                      styles.pageNumTxt
                    }
                  >
                    {'>'}
                  </Text>
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
  screen: {
    flex: 1,
    backgroundColor:
      colors.surface,
  },

  hero: {
    backgroundColor:
      '#FFFFFF',
    paddingHorizontal:
      layout.screenPadding,
    paddingBottom:
      spacing.lg,
    paddingTop:
      spacing.xl,
  },

  heroTopRow: {
    flexDirection:
      'row',
    justifyContent:
      'space-between',
    alignItems:
      'flex-start',
  },

  loginButton: {
    backgroundColor:
      '#041147',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius:
      radius.pill,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight:
      'bold',
  },

  heroTitle: {
    fontSize:
      typography.size.xxl,
    fontWeight:
      typography.weight.bold,
    color: '#041147',
    textTransform:
      'uppercase',
  },

  heroSub: {
    marginTop: 4,
    fontSize:
      typography.size.md,
    color: '#FF8300',
    fontWeight:
      typography.weight.bold,
    marginBottom:
      spacing.lg,
  },

  searchInput: {
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.sm,
    paddingHorizontal:
      spacing.md,
    paddingVertical: 12,
    fontSize:
      typography.size.body,
    backgroundColor:
      colors.surface,
    color:
      colors.text,
    marginBottom:
      spacing.sm,
  },

  filterButton: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
    backgroundColor:
      '#F5F6FA',
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius:
      radius.sm,
    paddingHorizontal:
      spacing.md,
    paddingVertical: 11,
  },

  filterButtonOpen: {
    backgroundColor:
      '#F0F2F8',
    borderColor:
      '#041147',
  },

  filterButtonLeft: {
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: spacing.sm,
  },

  filterButtonText: {
    color: '#041147',
    fontSize: 14,
    fontWeight:
      '700',
  },

  filterCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor:
      '#FF8300',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  filterCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight:
      'bold',
  },

  filterPanel: {
    marginTop:
      spacing.sm,
    padding:
      spacing.md,
    backgroundColor:
      '#F8F9FC',
    borderRadius:
      radius.md,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  filterHeader: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  filterLabel: {
    color: '#041147',
    fontSize: 12,
    fontWeight:
      '700',
    marginBottom: 4,
  },

  resetFilterText: {
    color: '#FF8300',
    fontSize: 11,
    fontWeight:
      '700',
  },

  filterScroll: {
    paddingVertical:
      spacing.xs,
    gap: spacing.sm,
  },

  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius:
      radius.pill,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  filterPillActive: {
    backgroundColor:
      '#FF8300',
    borderColor:
      '#FF8300',
  },

  filterPillText: {
    fontSize: 12,
    fontWeight:
      '600',
    color:
      colors.textMuted,
  },

  filterPillTextActive: {
    color: '#FFFFFF',
  },

  clearFiltersButton: {
    alignSelf:
      'flex-end',
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 4,
    marginTop:
      spacing.sm,
    paddingHorizontal:
      spacing.sm,
    paddingVertical: 6,
  },

  clearFiltersText: {
    color: '#FF8300',
    fontSize: 12,
    fontWeight:
      '700',
  },

  bannerError: {
    marginHorizontal:
      layout.screenPadding,
    marginTop:
      spacing.sm,
    padding:
      spacing.md,
    backgroundColor:
      '#ffebee',
    color:
      colors.error,
    borderRadius:
      radius.sm,
  },

  listContent: {
    paddingHorizontal:
      layout.screenPadding,
    paddingTop:
      spacing.sm,
    paddingBottom:
      spacing.xxxl,
  },

  card: {
    backgroundColor:
      colors.card,
    borderRadius:
      radius.md,
    marginBottom:
      spacing.lg,
    overflow:
      'hidden',
    shadowColor:
      '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  cardCover: {
    height: 240,
    width: '100%',
    position:
      'relative',
    justifyContent:
      'flex-end',
  },

  cardImagePh: {
    backgroundColor:
      '#cfd8e8',
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(0,0,0,0.3)',
  },

  topBadge: {
    position:
      'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor:
      '#FF8300',
    paddingHorizontal:
      spacing.md,
    paddingVertical: 4,
    borderRadius:
      radius.pill,
  },

  topBadgeText: {
    color: '#FFFFFF',
    fontSize:
      typography.size.xs,
    fontWeight:
      typography.weight.bold,
  },

  cardTextContent: {
    padding:
      spacing.lg,
  },

  cardMeta: {
    color: '#FFFFFF',
    fontSize:
      typography.size.sm,
    fontWeight:
      typography.weight.semibold,
    marginBottom: 4,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight:
      typography.weight.bold,
    textShadowColor:
      'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  bottomStrip: {
    paddingVertical: 10,
    paddingHorizontal:
      spacing.lg,
  },

  stripText: {
    color: '#FFFFFF',
    fontSize:
      typography.size.sm,
    fontWeight:
      typography.weight.medium,
  },

  footer: {
    marginTop:
      spacing.md,
    paddingBottom:
      spacing.lg,
  },

  pagination: {
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: spacing.sm,
  },

  pageArrow: {
    width: 40,
    height: 40,
    borderRadius:
      radius.md,
    alignItems:
      'center',
    justifyContent:
      'center',
    backgroundColor:
      colors.card,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  pageArrowDisabled: {
    opacity: 0.4,
  },

  pageNumBtn: {
    width: 40,
    height: 40,
    borderRadius:
      radius.md,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  pageNumBtnActive: {
    backgroundColor:
      '#041147',
  },

  pageNumBtnIdle: {
    backgroundColor:
      colors.card,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  pageNumTxt: {
    fontSize:
      typography.size.md,
    fontWeight:
      typography.weight.bold,
  },

  pageNumTxtActive: {
    color:
      colors.textOnDark,
  },

  pageNumTxtIdle: {
    color:
      colors.text,
  },

  empty: {
    textAlign:
      'center',
    marginTop:
      spacing.xxxl,
    color:
      colors.textMuted,
  },
});