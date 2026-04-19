import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { HomeStackParamList } from '../navigation/types';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = any; // Bypass TS mismatch temporarily for CartTab vs CartStack

export function CartScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { items, totalSelected, toggleSelection, toggleAll, removeFromCart } = useCart();
  const { user } = useAuth();
  const isGuest = !user;
  const exitGuestToLogin = () => {};

  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const handleCheckout = () => {
    if (items.filter((i) => i.selected).length === 0) {
      Alert.alert('Carrito vacío', 'Debes seleccionar al menos un curso para pagar.');
      return;
    }
    if (isGuest) {
      Alert.alert(
        'Inicia sesión',
        'Debes crear una cuenta o iniciar sesión para poder adquirir estos programas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a Login', onPress: () => exitGuestToLogin() },
        ]
      );
    } else {
      Alert.alert('Mockup de Pago', `Procediendo a pagar RD$ ${totalSelected.toFixed(2)}`);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.course.id.toString()}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="cart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>Tu carrito está vacío</Text>
            <Pressable style={styles.exploreBtn} onPress={() => navigation.navigate('CoursesList')}>
              <Text style={styles.exploreBtnText}>Explorar Programas</Text>
            </Pressable>
          </View>
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.header}>
              <Pressable style={styles.selectAllRow} onPress={() => toggleAll(!allSelected)}>
                <Ionicons
                  name={allSelected ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={allSelected ? colors.primary : colors.textMuted}
                />
                <Text style={styles.selectAllText}>Seleccionar todos los artículos</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Pressable style={styles.checkboxWrap} onPress={() => toggleSelection(item.course.id)}>
              <Ionicons
                name={item.selected ? 'checkbox' : 'square-outline'}
                size={24}
                color={item.selected ? colors.primary : colors.textMuted}
              />
            </Pressable>
            
            {item.course.imagen ? (
              <Image source={{ uri: item.course.imagen }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={[styles.image, { backgroundColor: '#e2e8f0' }]} />
            )}
            
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.course.title}</Text>
              <Text style={styles.price}>
                RD$ {(item.course as any).price || item.course.acf?.precio_regular || '1,500'}
              </Text>
              
              <View style={styles.actions}>
                <Pressable onPress={() => removeFromCart(item.course.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal ({items.filter(i => i.selected).length} prods):</Text>
            <Text style={styles.totalValue}>RD$ {totalSelected.toFixed(2)}</Text>
          </View>
          <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Proceder al Pago</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.md },
  header: { marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  selectAllRow: { flexDirection: 'row', alignItems: 'center' },
  selectAllText: { marginLeft: spacing.sm, fontSize: typography.size.md, color: colors.text, fontWeight: typography.weight.medium },
  cartItem: { flexDirection: 'row', backgroundColor: colors.card, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  checkboxWrap: { justifyContent: 'center', paddingRight: spacing.sm },
  image: { width: 80, height: 80, borderRadius: radius.sm, marginRight: spacing.md },
  info: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: typography.size.md, color: colors.text, fontWeight: typography.weight.semibold },
  price: { fontSize: typography.size.lg, color: colors.primary, fontWeight: typography.weight.bold, marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: spacing.sm },
  deleteText: { color: colors.error, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  emptyWrap: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: spacing.md, fontSize: typography.size.lg, color: colors.textMuted },
  exploreBtn: { marginTop: spacing.xl, backgroundColor: colors.primary, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: radius.pill },
  exploreBtnText: { color: colors.onPrimary, fontWeight: typography.weight.bold },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, alignItems: 'flex-end' },
  totalLabel: { fontSize: typography.size.md, color: colors.text },
  totalValue: { fontSize: 20, fontWeight: typography.weight.bold, color: colors.primary },
  checkoutBtn: { backgroundColor: '#FF8300', paddingVertical: 16, borderRadius: radius.pill, alignItems: 'center' },
  checkoutBtnText: { color: '#FFF', fontSize: typography.size.md, fontWeight: typography.weight.bold },
});
