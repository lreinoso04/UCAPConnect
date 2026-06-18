import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { GraduationCap, SlidersHorizontal } from 'lucide-react-native';
import { Course } from '../types/product';
import { Colors } from '../colors';
import { CourseCard } from '../components/cart/ProductCard';
import { CategoryFilter } from '../components/cart/CategoryFilter';
import { useNavigation } from '@react-navigation/native';
import { getCourses } from '@/services/course';
import { HomeStackParamList } from '@/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';

const CATEGORIES = ['Todos', 'Tecnología', 'Diseño', 'Marketing', 'Negocios', 'Creatividad'];

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const CARD_MARGIN = 12;
const CARD_WIDTH = (screenWidth - 40 - CARD_MARGIN) / numColumns;

export function CatalogScreen() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [error, setError] = useState<string | null>(null);
    type NavProps = NativeStackNavigationProp<HomeStackParamList, 'Catalog'>;

    const navigation = useNavigation<NavProps>();

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true); // 👈 IMPORTANTE
            setError(null);

            const data = await getCourses();

            const filteredCourses =
                selectedCategory === 'Todos'
                    ? data
                    : data.filter(course => course.category === selectedCategory);

            setCourses(filteredCourses);
        } catch (error) {
            console.error(error);
            setError('Error al cargar cursos.');
        } finally {
            setLoading(false);      // 👈 ESTO TE FALTABA
            setRefreshing(false);
        }
    }, [selectedCategory]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const handleCoursePress = (course: Course) => {
        console.log('Curso seleccionado:', course.id);
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

    return (
        <View style={styles.root}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Catalogo</Text>
                    <Text style={styles.subtitle}>Cursos y capacitaciones</Text>
                </View>
                <View style={styles.iconCircle}>
                    <SlidersHorizontal size={20} color={Colors.primary[600]} strokeWidth={2} />
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
                    {/* <GraduationCap size={48} color={Colors.neutral[300]} strokeWidth={1.5} /> */}
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[600]} />}
                    renderItem={({ item, index }) => (
                        <View style={styles.cardWrapper}>
                            <CourseCard course={item} onPress={handleCoursePress} index={index} />
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#041147'
    },
    filterContainer: {
        height: 60,
        justifyContent: 'center',
    },
    greeting: {
        fontFamily: 'Inter-Bold',
        fontSize: 28,
        color: "#FFFF",
        lineHeight: 34,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
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