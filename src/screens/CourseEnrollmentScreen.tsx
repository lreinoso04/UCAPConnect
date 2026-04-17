import { useEffect, useState } from 'react';
import {
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
import { getProfile } from '../api/student';
import { ApiException } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { HomeStackParamList } from '../navigation/types';
import { colors, layout, radius, spacing, typography } from '../theme';
import {
  formatDocumentoIdentidadDisplay,
  formatPhoneRdDisplay,
  normalizeDocumentoIdentidad,
} from '../utils/inputFormat';
import { normalizePhoneRd } from '../utils/profileValidation';

type Props = NativeStackScreenProps<HomeStackParamList, 'CourseEnrollment'>;

export function CourseEnrollmentScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { course } = route.params;
  const { user, isGuest } = useAuth();

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documentoId, setDocumentoId] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [aceptaDatos, setAceptaDatos] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user?.token || user.rol !== 'ESTUDIANTE') return;
    let cancelled = false;
    (async () => {
      try {
        const p = await getProfile(user.token);
        if (cancelled) return;
        setNombre(p.nombre ?? '');
        setApellidos(p.apellidos ?? '');
        setCorreo(p.correo ?? '');
        setTelefono(normalizePhoneRd(p.telefono ?? ''));
      } catch (e) {
        if (!(e instanceof ApiException)) {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.token, user?.rol]);

  function onSubmit() {
    if (!nombre.trim() || !apellidos.trim() || !correo.trim() || !telefono.trim() || !documentoId.trim()) {
      Alert.alert('Datos incompletos', 'Completa todos los campos obligatorios.');
      return;
    }
    if (!aceptaDatos) {
      Alert.alert('Confirmación requerida', 'Marca la casilla para confirmar que la información es correcta.');
      return;
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigation.goBack();
    }, 2500);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            style={styles.backRow}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={26} color={colors.textOnDark} />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>
          <Text style={styles.heroTitle}>Solicitud de inscripción</Text>
          <Text style={styles.heroSub} numberOfLines={3}>
            {course.title}
          </Text>
        </View>

        <View style={[styles.body, { paddingHorizontal: layout.screenPadding }]}>
          <View style={styles.previewBanner}>
            <Ionicons name="information-circle" size={22} color={colors.heroNavy} />
            <Text style={styles.previewBannerText}>
              Vista previa: el envío de solicitudes no está activo. Puedes completar el formulario como referencia; al
              habilitarse el servicio podrás enviarla desde aquí.
            </Text>
          </View>

          {isGuest ? (
            <View style={styles.guestBanner}>
              <Text style={styles.guestBannerText}>
                Cuando el envío esté disponible, es probable que necesites iniciar sesión con tu cuenta institucional.
              </Text>
            </View>
          ) : null}

          <Text style={styles.label}>
            Nombre <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>
            Apellidos <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={apellidos}
            onChangeText={setApellidos}
            placeholder="Apellidos"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>
            Correo electrónico <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>
            Teléfono <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formatPhoneRdDisplay(telefono)}
            onChangeText={(t) => setTelefono(normalizePhoneRd(t))}
            placeholder="809-123-4567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            maxLength={12}
          />

          <Text style={styles.label}>
            Documento de identidad <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={formatDocumentoIdentidadDisplay(documentoId)}
            onChangeText={(t) => setDocumentoId(normalizeDocumentoIdentidad(t))}
            placeholder="000-0000000-0 o pasaporte"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Comentarios (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comentarios}
            onChangeText={setComentarios}
            placeholder="Motivo de interés, horario preferido…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.checkRow, aceptaDatos && styles.checkRowOn]}
            onPress={() => setAceptaDatos((v) => !v)}
          >
            <View style={[styles.checkBox, aceptaDatos && styles.checkBoxOn]}>
              {aceptaDatos ? <Ionicons name="checkmark" size={16} color={colors.textOnDark} /> : null}
            </View>
            <Text style={styles.checkLabel}>
              Confirmo que los datos son correctos y entiendo que esta solicitud no se enviará hasta que el servicio
              esté disponible.
            </Text>
          </Pressable>

          <Pressable style={styles.btnPrimary} onPress={onSubmit}>
            <Text style={styles.btnPrimaryTxt}>Enviar solicitud de inscripción</Text>
          </Pressable>

          <Text style={styles.legal}>
            Al continuar aceptas que UCAPConnect trate estos datos según la política de privacidad institucional cuando
            el módulo esté en producción.
          </Text>
        </View>
      </ScrollView>

      {showSuccess && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.overlayBg}>
            <View style={styles.lottieCard}>
              <Ionicons name="checkmark-circle" size={80} color="#2e7d32" style={{ marginBottom: 16 }} />
              <Text style={styles.lottieTxt}>¡Inscripción confirmada!</Text>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1 },
  hero: {
    backgroundColor: colors.heroNavy,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textOnDark,
  },
  heroTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
  },
  heroSub: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  body: { paddingTop: spacing.lg },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.chipBlueBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(47, 128, 237, 0.25)',
  },
  previewBannerText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.heroNavy,
    lineHeight: typography.lineHeight.relaxed,
  },
  guestBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  guestBannerText: {
    fontSize: typography.size.sm,
    color: '#5d4037',
    lineHeight: typography.lineHeight.relaxed,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  req: { color: colors.accent },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.size.body,
    backgroundColor: colors.inputFill,
    color: colors.text,
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  checkRowOn: { borderColor: colors.interactiveBlue },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: colors.interactiveBlue,
    borderColor: colors.interactiveBlue,
  },
  checkLabel: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  btnPrimaryTxt: {
    color: colors.textOnDark,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
  },
  legal: {
    marginTop: spacing.lg,
    fontSize: typography.size.xs,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  lottieAnim: { width: 140, height: 140 },
  lottieTxt: { 
    fontSize: typography.size.md, 
    fontWeight: typography.weight.bold, 
    color: colors.heroNavy,
    marginTop: spacing.md
  }
});
