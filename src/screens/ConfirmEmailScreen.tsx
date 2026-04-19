import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AuthStackParamList } from '../navigation/types';
import { colors, spacing, typography, layout } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ConfirmEmail'>;

export function ConfirmEmailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('Procesando confirmación...');
  const [icon, setIcon] = useState<'checkmark-circle' | 'close-circle'>('checkmark-circle');

  useEffect(() => {
    const status = route.params?.status;

    if (!status) {
      setIsProcessing(false);
      setIcon('close-circle');
      setMessage('Parámetros inválidos');
      return;
    }

    // Simular procesamiento (1.5s para que vea el estado)
    const timer = setTimeout(() => {
      if (status === 'success') {
        setIsProcessing(false);
        setIcon('checkmark-circle');
        setMessage('✅ Correo confirmado\n¡Ya puedes iniciar sesión!');

        // Navegar a Login después de 1 segundo
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Login',
                params: { emailConfirmed: 'true' },
              },
            ],
          });
        }, 1000);
      } else {
        setIsProcessing(false);
        setIcon('close-circle');
        setMessage('❌ Error al confirmar\nIntenta de nuevo');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [route.params?.status, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
            <Text style={styles.message}>{message}</Text>
          </>
        ) : (
          <>
            <Ionicons
              name={icon}
              size={80}
              color={icon === 'checkmark-circle' ? colors.success : colors.error}
              style={styles.icon}
            />
            <Text style={[styles.message, { marginTop: spacing.lg }]}>{message}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  icon: {
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 28,
  },
});
