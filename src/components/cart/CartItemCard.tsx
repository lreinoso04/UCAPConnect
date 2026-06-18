import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Trash2, Clock, Users } from 'lucide-react-native';
import { CartItem } from '@/types/product';
import { Colors } from '@/colors';
import { useCart } from '@/context/CartContext';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { removeItem } = useCart();

  const course = item?.course;

  // 🔒 PROTECCIÓN CRÍTICA
  if (!course) return null;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: course.image_url || '' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={styles.textCol}>
            <Text style={styles.name} numberOfLines={2}>
              {course.name || 'Sin nombre'}
            </Text>
            <Text style={styles.instructor}>
              {course.instructor || 'Sin instructor'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeItem(course.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={Colors.error[500]} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color={Colors.neutral[400]} strokeWidth={2} />
            <Text style={styles.metaText}>
              {course.duration || 'N/A'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Users size={12} color={Colors.neutral[400]} strokeWidth={2} />
            <Text style={styles.metaText}>
              {course.students_count || 0} estudiantes
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View
            style={[
              styles.levelTag,
              { backgroundColor: (course.badge_color || '#000') + '15' }
            ]}
          >
            <Text
              style={[
                styles.levelText,
                { color: course.badge_color || Colors.neutral[600] }
              ]}
            >
              {course.level || 'N/A'}
            </Text>
          </View>

          <Text style={styles.price}>
            {(course.price ?? 0).toLocaleString('es-DO', {
              style: 'currency',
              currency: 'DOP',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: {
    width: 90,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.neutral[100],
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textCol: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.neutral[900],
    lineHeight: 18,
  },
  instructor: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error[500] + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: Colors.neutral[400],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  levelTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: Colors.primary[600],
  },
});
