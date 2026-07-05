import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Trash2, ArrowRight, GraduationCap } from 'lucide-react-native';
import { Colors } from '../colors';
import { useCart } from '../context/CartContext';
import { CartItemCard } from '../components/cart/CartItemCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { createPaymentIntent } from '@/services/payment';

export function CartScreen() {
  const { items, totalItems, totalPrice, clearCart, loadCart } = useCart();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const handleClearCart = () => {
    Alert.alert('Vaciar carrito', '¿Eliminar todos los cursos del carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clearCart },
    ]);
  };

  const handleCheckout = async () => {
    try {

      const payment = await createPaymentIntent();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'UCAP Connect',
        paymentIntentClientSecret: payment.clientSecret,
        returnURL: 'ucapconnect://stripe-redirect',

      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      const result = await presentPaymentSheet();

      if (result.error) {
        Alert.alert('Pago cancelado', result.error.message);
        return;
      }

      // 1. Notificar éxito
      Alert.alert('Éxito', 'Pago realizado correctamente');

      // 3. Recargar carrito desde backend (importante)
      await loadCart();

    } catch (error) {
      console.log('CATCH ERROR:', error);
      Alert.alert('Error', 'No fue posible procesar el pago');
    }
  };
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <GraduationCap size={56} color={Colors.neutral[300]} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>Explora el catálogo para inscribirte en cursos</Text>
        <TouchableOpacity style={styles.browseButton} activeOpacity={0.8} onPress={() => navigation.navigate('CatalogTab')}>
          <Text style={styles.browseButtonText}>Ver catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>{totalItems} {totalItems === 1 ? 'curso' : 'cursos'}</Text>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCart} activeOpacity={0.7}>
          <Trash2 size={18} color={Colors.error[500]} strokeWidth={2} />
          <Text style={styles.clearText}>Vaciar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.cursoId.toString()}
        contentContainerStyle={[
          styles.list,
          items.length === 0 && { flexGrow: 1 }
        ]}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CartItemCard item={item} />}
      />

      <View style={styles.footer}>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {totalPrice.toLocaleString('es-DO', {
                style: 'currency',
                currency: 'DOP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Descuento</Text>
            <Text style={styles.summaryValueFree}>
              -{(0).toLocaleString('es-DO', {
                style: 'currency',
                currency: 'DOP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {totalPrice.toLocaleString('es-DO', {
                style: 'currency',
                currency: 'DOP',
              })}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.8}>
          <Text style={styles.checkoutText}>Proceder al pago</Text>
          <ArrowRight size={20} color={Colors.white} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.paymentInfo}>
          <Text style={styles.secureText}>
            🔒 Pago seguro procesado por Stripe
          </Text>
          <Text style={styles.cardsText}>
            Visa • Mastercard  • Apple Pay • American Express
          </Text>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.neutral[900],
    lineHeight: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.neutral[400],
    marginTop: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.error[500] + '10',
    marginTop: 4,
  },
  clearText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.error[500],
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  paymentInfo: {
    alignItems: 'center',
    marginTop: 12,
  },

  secureText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.neutral[500],
  },

  cardsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: Colors.neutral[400],
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  summary: {
    gap: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[500],
  },
  summaryValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.neutral[700],
  },
  summaryValueFree: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.success[500],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.neutral[900],
  },
  totalValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.primary[600],
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary[600],
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.neutral[800],
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.neutral[400],
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.white,
  },
});