import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ApiException } from '../api/client';
import type { AuthStackParamList } from '../navigation/types';
import { colors, layout, radius, spacing, typography } from '../theme';

const logoSource = require('../../assets/logo-ucap.png');
const windowH = Dimensions.get('window').height;  // kept for minHeight fallback

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { login, enterAsGuest } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  async function onSubmit() {
    setError(null);
    if (!username.trim() || !password) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (e) {
      const msg = e instanceof ApiException ? e.message : 'No se pudo iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGuest() {
    setError(null);
    setLoading(true);
    try {
      await enterAsGuest();
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        bounces={false}
      >
        {!keyboardVisible && (
        <View style={[styles.hero, { paddingTop: insets.top + spacing.lg, minHeight: windowH * 0.4 }]}>
          <Image source={logoSource} style={styles.logo} contentFit="contain" accessibilityLabel="UCAP" />
          <Text style={styles.heroTitle}>UCAP Connect</Text>
          <Text style={styles.heroSubtitle}>Centro de Capacitación Profesional - UAPA</Text>
          <View style={styles.heroAccent} />
        </View>
        )}

        <View style={[styles.formBlock, keyboardVisible && { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.welcome}>¡Bienvenido!</Text>
          <Text style={styles.welcomeHint}>Inicia sesión para continuar</Text>

          <Text style={styles.fieldLabel}>Usuario / Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu usuario o correo institucional"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          <Text style={styles.fieldLabel}>Contraseña</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          <Pressable
            style={styles.forgotWrap}
            onPress={() =>
              Alert.alert(
                'Recuperar contraseña',
                'Contacta a la institución o usa el portal web cuando esté disponible.'
              )
            }
            disabled={loading}
          >
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
            )}
          </Pressable>

          <View style={styles.registerRow}>
            <Text style={styles.registerQ}>¿No tienes cuenta? </Text>
            <Pressable onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text style={styles.registerLink}>Registrate gratis</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.guestLink, loading && styles.btnDisabled]}
            onPress={onGuest}
            disabled={loading}
          >
            <Text style={styles.guestLinkText}>Explorar sin cuenta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card },
  scroll: { flexGrow: 1 },
  hero: {
    position: 'relative',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
  },
  logo: {
    width: 220,
    height: 88,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  heroAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.accent,
  },
  formBlock: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl + spacing.lg,
    backgroundColor: colors.card,
  },
  welcome: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.text,
  },
  welcomeHint: {
    marginTop: spacing.xs,
    fontSize: typography.size.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg },
  forgot: { fontSize: typography.size.sm, color: colors.interactiveBlue, fontWeight: typography.weight.medium },
  error: { color: colors.error, marginBottom: spacing.md, fontSize: typography.size.sm },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  btnDisabled: { opacity: 0.65 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  registerQ: { fontSize: typography.size.md, color: colors.textMuted },
  registerLink: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.interactiveBlue,
  },
  guestLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  guestLinkText: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
