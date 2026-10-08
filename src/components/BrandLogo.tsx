import React from 'react';
import { Image } from 'expo-image';
import { Text, View } from '../ui/themedNative';
import { usePreferences } from '../i18n/preferences';

type LogoSize = 'small' | 'medium' | 'large';

const metrics: Record<LogoSize, { icon: number; name: number; slogan: number; gap: number }> = {
  small: { icon: 42, name: 16, slogan: 6.3, gap: 6 },
  medium: { icon: 56, name: 21, slogan: 8, gap: 8 },
  large: { icon: 72, name: 26, slogan: 9.8, gap: 9 },
};

export default function BrandLogo({ size = 'medium', tone = 'auto', symbolOnly = false }: {
  size?: LogoSize;
  tone?: 'auto' | 'light' | 'dark';
  symbolOnly?: boolean;
}) {
  const { dark, t } = usePreferences();
  const onDark = tone === 'dark' || (tone === 'auto' && dark);
  const m = metrics[size];
  const source = onDark
    ? require('../../assets/ucapconnect-symbol-dark.png')
    : require('../../assets/ucapconnect-symbol.png');

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', maxWidth: '100%' }} accessibilityLabel={t('UCAPConnect, Sistema de Capacitación Profesional de la UAPA')}>
      <Image source={source} contentFit="contain" style={{ width: m.icon, height: m.icon }} />
      {!symbolOnly && (
        <View style={{ flexShrink: 1, marginLeft: m.gap }}>
          <Text numberOfLines={1} style={{ fontSize: m.name, fontWeight: '800', letterSpacing: -1.2, color: onDark ? '#F1F5F9' : '#082856' }}>
            UCAP<Text style={{ color: '#FF7500' }}>CONNECT</Text>
          </Text>
          <View style={{ height: 2, backgroundColor: '#FF7500', marginTop: 1, marginBottom: 3 }} />
          <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: m.slogan, fontWeight: '500', color: onDark ? '#DBEAFE' : '#173B69' }}>
            {t('Sistema de Capacitación Profesional de la UAPA')}
          </Text>
        </View>
      )}
    </View>
  );
}
