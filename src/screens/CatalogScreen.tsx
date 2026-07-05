import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Dimensions, TextInput } from 'react-native';
import { GraduationCap, Search } from 'lucide-react-native';
import { Course } from '../types/product';
import { Colors } from '../colors';
import { CourseCard } from '../components/cart/ProductCard';
import { CategoryFilter } from '../components/cart/CategoryFilter';
import { useNavigation } from '@react-navigation/native';
import { getCourses } from '@/services/course';
import { HomeStackParamList } from '@/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/theme';

const CATEGORIES = ['Todos', 'Tecnología', 'Diseño', 'Marketing', 'Negocios', 'Creatividad'];

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const CARD_MARGIN = 12;
const CARD_WIDTH = (screenWidth - 40 - CARD_MARGIN) / numColumns;

export function CatalogScreen() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [error, setError] = useState<string | null>(null);
    type NavProps = NativeStackNavigationProp<HomeStackParamList, 'Catalog'>;

    const navigation = useNavigation<NavProps>();

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getCourses(1, 10, searchTerm);

            setCourses(data);
            setPage(1);

            // Si devuelve menos de 10, ya no hay más páginas
            setHasMore(data.length === 10);

        } catch (error) {
            setError('Error al cargar cursos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const handleCoursePress = (course: Course) => {
        navigation.navigate('CatalogDetails', {
            id: course.id,
        });
    };

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary[600]} />
                <Text style={styles.loadingText}>Cargando catálogo...</Text>
            </View>
        );
    }

    const loadMoreCourses = async () => {

        if (loading || loadingMore || !hasMore) {
            return;
        }

        try {

            setLoadingMore(true);

            const nextPage = page + 1;

            const newCourses = await getCourses(
                nextPage,
                10,
                searchTerm
            );

            setCourses(prev => [...prev, ...newCourses]);

            setPage(nextPage);

            if (newCourses.length < 10) {
                setHasMore(false);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Catalogo</Text>
                    <Text style={styles.subtitle}>Cursos y capacitaciones</Text>
                </View>
               
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Search
                        size={20}
                        color={Colors.neutral[400]}
                        strokeWidth={2}
                    />

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar cursos..."
                        placeholderTextColor={Colors.neutral[400]}
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            setCourses([]);
                            setPage(1);
                            setHasMore(true);
                            setSearchTerm(searchText);
                        }}
                    />
                </View>
            </View>

            <View style={styles.filterContainer}>
                <CategoryFilter
                    categories={CATEGORIES}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <GraduationCap size={48} color={Colors.neutral[300]} strokeWidth={1.5} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : courses.length === 0 ? (
                <View style={styles.errorContainer}>
                    <GraduationCap size={48} color={Colors.neutral[300]} strokeWidth={1.5} />
                    <Text style={styles.errorText}>No hay cursos en esta categoría</Text>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={item => item.id}
                    numColumns={numColumns}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary[600]}
                        />
                    }
                    renderItem={({ item, index }) => (
                        <View style={styles.cardWrapper}>
                            <CourseCard
                                course={item}
                                onPress={handleCoursePress}
                                index={index}
                            />
                        </View>
                    )}
                    onEndReached={loadMoreCourses}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? (
                            <View style={styles.footerLoader}>
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.primary[600]}
                                />
                                <Text style={styles.footerText}>
                                    Cargando más cursos...
                                </Text>
                            </View>
                        ) : null
                    }
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 18,
        backgroundColor: '#041147'
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 1,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    footerText: {
        marginTop: 8,
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.neutral[500],
    },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        paddingHorizontal: 16,
        gap: 12,

        borderWidth: 1,
        borderColor: '#EEF2F7',
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Colors.neutral[900],
    },
    filterContainer: {
        height: 60,
        justifyContent: 'center',
    },
    greeting: {
        fontFamily: 'Inter-Bold',
        fontSize: 23,
        color: colors.onPrimary,
        lineHeight: 34,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.neutral[400],
        marginTop: 2,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    grid: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    row: {
        gap: CARD_MARGIN,
        marginBottom: CARD_MARGIN,
    },
    cardWrapper: {
        width: CARD_WIDTH,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        gap: 12,
    },
    loadingText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: Colors.neutral[400],
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 40,
    },
    errorText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: Colors.neutral[400],
        textAlign: 'center',
    },
});