import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
import { Star, Plus, Check, Clock, Users } from 'lucide-react-native';
import { Course } from '@/types/product';
import { Colors } from '@/colors';
import { useCart } from '@/context/CartContext';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  index: number;
}

export function CourseCard({ course, onPress}: CourseCardProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(Number(course.id));

  return (
    <View>
      <Pressable
        style={styles.card}
        onPress={() => onPress(course)}
        android_ripple={{ color: Colors.neutral[200], borderless: false }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: course.image_url }} style={styles.image} resizeMode="cover" />
          <View style={[styles.categoryBadge, { backgroundColor: course.badge_color }]}>
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{course.level}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{course.name}</Text>
          <View style={styles.metaRow}>
            <Clock size={12} color={Colors.neutral[400]} strokeWidth={2} />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Star size={13} color={Colors.warning[500]} fill={Colors.warning[500]} strokeWidth={1.5} />
            <Text style={styles.ratingText}>{course.rating}</Text>
            <Text style={styles.reviewsText}>({course.reviews_count})</Text>
            <View style={styles.studentsDot} />
            <Users size={12} color={Colors.neutral[400]} strokeWidth={2} />
            <Text style={styles.metaText}>{course.students_count}</Text>
          </View>
          <View style={styles.priceRow}><Text style={styles.price}>
            {(course.price ?? 0).toLocaleString('es-DO', {
              style: 'currency',
              currency: 'DOP',
            })}
          </Text>
            <TouchableOpacity
              style={[styles.addButton, inCart && styles.addedButton]}
              onPress={() => !inCart && addItem(Number(course.id))}
              activeOpacity={inCart ? 1 : 0.7}
            >
              {inCart ? (
                <Check size={14} color={Colors.white} strokeWidth={2.5} />
              ) : (
                <Plus size={16} color={Colors.white} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    flex: 1,
    maxWidth: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: Colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  levelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 9,
    color: Colors.neutral[600],
  },
  info: {
    padding: 12,
    gap: 5,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: Colors.neutral[900],
    lineHeight: 17,
    minHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: Colors.neutral[400],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: Colors.neutral[700],
  },
  reviewsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: Colors.neutral[400],
  },
  studentsDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.primary[600],
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addedButton: {
    backgroundColor: Colors.success[500],
    shadowColor: Colors.success[500],
  },
});
