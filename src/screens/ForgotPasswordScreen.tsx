import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { forgotPassword } from '../api/auth';
import { ApiException } from '../api/client';
import type { AuthStackParamList } from '../navigation/types';
import { colors, layout, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      const response = await forgotPassword(email.trim());
      Alert.alert('Éxito', response.message);
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof ApiException ? e.message : 'Error al enviar el correo';
      Alert.alert('Error', msg);
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
        <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </Pressable>

          <Text style={styles.title}>Restablecer Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Text>

          <Text style={styles.fieldLabel}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu correo electrónico..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          <Pressable
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>Enviar Enlace</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});