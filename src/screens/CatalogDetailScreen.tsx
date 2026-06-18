import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Clock, Users, BarChart3 } from 'lucide-react-native';
import { Course } from '@/types/product';
import { Colors } from '../colors';
import { useCart } from '@/context/CartContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getCourseById } from '@/services/course';

export function CatalogDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params as { id: string };

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const { addItem, isInCart } = useCart();

    useEffect(() => {
        async function fetchCourse() {
            try {
                setLoading(true);

                const data = await getCourseById(id);

                setCourse(data);
            } catch (error) {
                console.error('Error cargando curso:', error);
                setCourse(null);
            } finally {
                setLoading(false);
            }
        }

        fetchCourse();
    }, [id]);
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary[600]} />
            </View>
        );
    }

    if (!course) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.notFoundText}>Curso no encontrado</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const inCart = isInCart(course.id);

    const handleEnroll = () => {
        if (!inCart) {
            addItem(course);
        }
        navigation.goBack();
    };

    return (
        <View style={styles.root}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View>
                    <View style={styles.imageSection}>
                        <Image source={{ uri: course.image_url }} style={styles.heroImage} resizeMode="cover" />
                        <View style={styles.imageOverlay} />
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <ArrowLeft size={20} color={Colors.white} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <View style={styles.floatingActions}>
                            <TouchableOpacity
                                style={[styles.floatBtn, liked && styles.floatBtnActive]}
                                onPress={() => setLiked(!liked)}
                                activeOpacity={0.7}
                            >
                                <Heart
                                    size={20}
                                    color={liked ? Colors.error[500] : Colors.white}
                                    fill={liked ? Colors.error[500] : 'transparent'}
                                    strokeWidth={2}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.floatBtn} activeOpacity={0.7}>
                                <Share2 size={20} color={Colors.white} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.imageBottom}>
                            <View style={[styles.categoryBadge, { backgroundColor: course.badge_color }]}>
                                <Text style={styles.categoryText}>{course.category}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.detailsSection}>
                    <Text style={styles.courseName}>{course.name}</Text>

                    <View style={styles.instructorRow}>
                        <View style={styles.instructorAvatar}>
                            <Text style={styles.instructorInitial}>{course.instructor.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.instructorLabel}>Instructor</Text>
                            <Text style={styles.instructorName}>{course.instructor}</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Clock size={18} color={Colors.primary[600]} strokeWidth={2} />
                            <Text style={styles.statValue}>{course.duration}</Text>
                            <Text style={styles.statLabel}>Duración</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <BarChart3 size={18} color={Colors.primary[600]} strokeWidth={2} />
                            <Text style={styles.statValue}>{course.level}</Text>
                            <Text style={styles.statLabel}>Nivel</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Users size={18} color={Colors.primary[600]} strokeWidth={2} />
                            <Text style={styles.statValue}>{course.students_count}</Text>
                            <Text style={styles.statLabel}>Estudiantes</Text>
                        </View>
                    </View>

                    <View style={styles.ratingRow}>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s}
                                    size={16}
                                    color={Colors.warning[500]}
                                    fill={s <= Math.round(course.rating) ? Colors.warning[500] : 'transparent'}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </View>
                        <Text style={styles.ratingValue}>{course.rating}</Text>
                        <Text style={styles.reviewsCount}>({course.reviews_count} reseñas)</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.description}>{course.description}</Text>

                    <View style={styles.spacer} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerPriceLabel}>Precio</Text>
                    <Text style={styles.footerPrice}>
                        {Number(course?.price ?? 0).toLocaleString('es-DO', {
                            style: 'currency',
                            currency: 'DOP',
                        })}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.enrollButton, inCart && styles.enrolledButton]}
                    onPress={handleEnroll}
                    activeOpacity={inCart ? 1 : 0.8}
                >
                    <ShoppingCart size={20} color={Colors.white} strokeWidth={2} />
                    <Text style={styles.enrollText}>
                        {inCart ? 'Ya en carrito' : 'Inscribirme'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        gap: 12,
    },
    notFoundText: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: Colors.neutral[600],
    },
    goBackText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: Colors.primary[600],
    },
    imageSection: {
        position: 'relative',
        height: 280,
        backgroundColor: Colors.neutral[100],
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingActions: {
        position: 'absolute',
        top: 16,
        right: 16,
        gap: 10,
    },
    floatBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatBtnActive: {
        backgroundColor: 'rgba(239,68,68,0.7)',
    },
    imageBottom: {
        position: 'absolute',
        bottom: 12,
        left: 16,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    categoryText: {
        fontFamily: 'Inter-Bold',
        fontSize: 12,
        color: Colors.white,
    },
    detailsSection: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    courseName: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: Colors.neutral[900],
        lineHeight: 30,
        marginBottom: 16,
    },
    instructorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    instructorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructorInitial: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: Colors.primary[600],
    },
    instructorLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: Colors.neutral[400],
    },
    instructorName: {
        fontFamily: 'Inter-Bold',
        fontSize: 15,
        color: Colors.neutral[800],
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary[50],
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: Colors.neutral[800],
    },
    statLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 11,
        color: Colors.neutral[500],
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.primary[100],
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: Colors.neutral[700],
    },
    reviewsCount: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: Colors.neutral[400],
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    sectionTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: Colors.neutral[900],
        marginBottom: 8,
    },
    description: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: Colors.neutral[600],
        lineHeight: 24,
    },
    spacer: {
        height: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerPriceLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: Colors.neutral[400],
    },
    footerPrice: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: Colors.primary[600],
    },
    enrollButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primary[600],
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    enrolledButton: {
        backgroundColor: Colors.success[500],
        shadowColor: Colors.success[500],
    },
    enrollText: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: Colors.white,
    },
});