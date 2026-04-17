import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

const unreadNotifications = [
  {
    id: '1',
    icon: 'book-outline',
    iconColor: '#0056D2',
    iconBg: '#E8F0FE',
    dotColor: '#0056D2',
    title: 'Nuevo material disponible',
    body: 'El profesor ha subido material de apoyo para Desarrollo de Software',
    time: 'Hace 2 horas',
  },
  {
    id: '2',
    icon: 'calendar-outline',
    iconColor: '#D32F2F',
    iconBg: '#FCE8E8',
    dotColor: '#D32F2F',
    title: 'Clase próxima',
    body: 'Recuerda que mañana tienes clase de Contabilidad General a las 8:00 AM',
    time: 'Hace 3 horas',
  },
  {
    id: '3',
    icon: 'book-outline',
    iconColor: '#E65100',
    iconBg: '#FFF3E0',
    dotColor: '#FF9800',
    title: 'Nuevo material disponible',
    body: 'El profesor ha subido material de apoyo para Desarrollo de Software',
    time: 'Hace 2 horas', // same as mockup
  },
];

const olderNotifications = [
  {
    id: '4',
    icon: 'book-outline',
    iconColor: '#0056D2',
    iconBg: '#E8F0FE',
    dotColor: '#0056D2',
    title: 'Nuevo material disponible',
    body: 'El profesor ha subido material de apoyo para Desarrollo de Software',
    time: 'Hace 2 horas',
  },
];

export function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroTitle}>Notificaciones</Text>
            <Text style={styles.heroSub}>Tienes 3 notificaciones sin leer</Text>
          </View>
          <Pressable style={styles.homeBtn} onPress={() => navigation.navigate('Dashboard')}>
            <Ionicons name="home-outline" size={24} color="#FFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Notificaciones sin leer</Text>
        <View style={styles.list}>
          {unreadNotifications.map((notif) => (
            <Pressable key={notif.id} style={[styles.card, styles.cardUnread]}>
              <View style={styles.iconWrap}>
                <View style={[styles.iconBox, { backgroundColor: notif.iconBg }]}>
                  <Ionicons name={notif.icon as any} size={28} color={notif.iconColor} />
                </View>
                <View style={[styles.dot, { backgroundColor: notif.dotColor }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{notif.title}</Text>
                <Text style={styles.cardText}>{notif.body}</Text>
                <Text style={styles.cardTime}>{notif.time}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Notificaciones anteriores</Text>
        <View style={styles.list}>
          {olderNotifications.map((notif) => (
            <Pressable key={notif.id} style={styles.card}>
              <View style={styles.iconWrap}>
                <View style={[styles.iconBox, { backgroundColor: notif.iconBg }]}>
                  <Ionicons name={notif.icon as any} size={28} color={notif.iconColor} />
                </View>
                <View style={[styles.dot, { backgroundColor: notif.dotColor }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{notif.title}</Text>
                <Text style={styles.cardText}>{notif.body}</Text>
                <Text style={styles.cardTime}>{notif.time}</Text>
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0F0F0' },
  hero: {
    backgroundColor: '#041147',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  homeBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xxl, paddingTop: spacing.md },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardUnread: {
    backgroundColor: '#E5E5E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 0,
  },
  iconWrap: {
    position: 'relative',
    marginRight: spacing.md,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#041147',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  cardTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
});
