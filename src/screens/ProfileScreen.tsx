import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getProfile, updateProfile } from '../api/student';
import { changePassword } from '../api/auth';
import { BirthDatePickerField } from '../components/BirthDatePickerField';
import { useAuth } from '../context/AuthContext';
import { ApiException } from '../api/client';
import { dashboardStats } from '../data/dashboardMock';
import { getSegmentDisplayName, getSegmentNeedsLine, resolveSegment } from '../roles/segmentConfig';
import type { EstudianteProfile } from '../types/api';
import { colors, layout, radius, spacing, typography } from '../theme';
import { formatPhoneRdDisplay } from '../utils/inputFormat';
import {
  hasProfileErrors,
  normalizePhoneRd,
  validateEstudianteProfile,
  type ProfileFieldErrors,
} from '../utils/profileValidation';

const emptyProfile: EstudianteProfile = {
  nombre: '',
  apellidos: '',
  correo: '',
  telefono: '',
  fechaNacimiento: '',
  direccion: '',
};

type MenuIcon = keyof typeof Ionicons.glyphMap;

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: MenuIcon;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]} onPress={onPress}>
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={22} color={colors.interactiveBlue} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.menuSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUserImage } = useAuth();
  const isGuest = !user;
  const exitGuestToLogin = () => {};
  const [form, setForm] = useState<EstudianteProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  /** Borrador del modal; no muta `form` hasta guardar correctamente. */
  const [draft, setDraft] = useState<EstudianteProfile | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const isStudent = user?.rol === 'ESTUDIANTE';

  const load = useCallback(async () => {
    if (!user?.token || !isStudent) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    try {
      const data = await getProfile(user.token);
      setForm(data);
    } catch (e) {
      const message = e instanceof ApiException ? e.message : 'No se pudo cargar el perfil';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.token, isStudent]);

  useFocusEffect(
    useCallback(() => {
      if (isGuest || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      load();
    }, [load, isGuest, user])
  );

  useEffect(() => {
    if (!isStudent) setLoading(false);
  }, [isStudent]);

  function closeEditModal() {
    setEditOpen(false);
    setDraft(null);
    setFieldErrors({});
    setSaveError(null);
  }

  async function onSave() {
    if (!user?.token || !draft) return;
    const payload: EstudianteProfile = {
      ...draft,
      telefono: normalizePhoneRd(draft.telefono),
    };
    const errs = validateEstudianteProfile(payload);
    if (hasProfileErrors(errs)) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateProfile(user.token, payload);
      setForm(updated);
      closeEditModal();
      Alert.alert('Listo', 'Perfil actualizado.');
    } catch (e) {
      const message = e instanceof ApiException ? e.message : 'No se pudo guardar';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  function soon(title: string) {
    Alert.alert(title, 'Esta opción estará disponible en una próxima versión.');
  }

  async function onPickImage() {
    if (!isStudent) return;
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Se necesita acceso a tus fotos para cambiar la imagen del perfil.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS === 'ios', // Solo habilitar edición en iOS
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        try {
          await updateUserImage(result.assets[0].uri);
          Alert.alert('Listo', 'Foto de perfil actualizada correctamente.');
        } catch (updateError) {
          console.error('Error al actualizar imagen:', updateError);
          Alert.alert('Error', 'Hubo un problema al actualizar la imagen del perfil.');
        }
      }
    } catch (e) {
      console.error('Error al seleccionar imagen:', e);
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
    }
  }

  function openPersonalDataEditor() {
    if (!isStudent) return;
    setSaveError(null);
    setFieldErrors({});
    setDraft({ ...form });
    setEditOpen(true);
  }

  function openPwModal() {
    if (!isStudent) return;
    setPwCurrent('');
    setPwNew('');
    setPwConfirm('');
    setPwError(null);
    setPwModalOpen(true);
  }

  function closePwModal() {
    setPwModalOpen(false);
    setPwLoading(false);
  }

  async function onSavePassword() {
    if (!user?.token) return;
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError('Completa todos los campos');
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError('Las contraseñas nuevas no coinciden');
      return;
    }
    setPwError(null);
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwCurrent, newPassword: pwNew, confirmPassword: pwConfirm }, user.token);
      closePwModal();
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
    } catch (e) {
      setPwError(e instanceof ApiException ? e.message : 'No se pudo cambiar la contraseña');
    } finally {
      setPwLoading(false);
    }
  }

  if (isGuest) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.scrollGuest} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={48} color="#9ca3af" />
            </View>
          </View>
          <Text style={styles.heroName}>Invitado</Text>
          <Text style={styles.heroId}>{getSegmentDisplayName(resolveSegment(true, null))}</Text>
          <Text style={styles.heroGuestHint}>Explora el catálogo sin cuenta</Text>
        </View>
        <View style={[styles.orangeRule, { marginHorizontal: 0 }]} />
        <View style={[styles.guestBody, { paddingHorizontal: layout.screenPadding }]}>
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Modo invitado</Text>
            <Text style={styles.guestText}>
              Para guardar progreso, notas e inscripciones, inicia sesión con tu cuenta institucional.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => exitGuestToLogin()}>
              <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => exitGuestToLogin()}>
              <Text style={styles.secondaryBtnText}>Volver al inicio de sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!user) {
    return null;
  }

  const fullName =
    [form.nombre, form.apellidos].filter((s) => String(s).trim()).join(' ').trim() || user.username;
  const idLine = `ID: ${user.username}`;
  const segment = resolveSegment(false, user.rol);
  const careerLabel = `Perfil: ${getSegmentDisplayName(segment)}`;
  const correoSub = form.correo?.trim() || 'Sin registrar';
  const telDigits = normalizePhoneRd(form.telefono ?? '');
  const telSub = telDigits ? formatPhoneRdDisplay(telDigits) : 'Sin registrar';
  const certCount = dashboardStats.certificates;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable style={styles.avatarRing} onPress={() => void onPickImage()}>
          {user.img ? (
            <Image source={{ uri: user.img }} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={48} color="#9ca3af" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </Pressable>
        <Text style={styles.heroName}>{fullName}</Text>
        <Text style={styles.heroId}>{idLine}</Text>

        {loading && isStudent ? (
          <ActivityIndicator color={colors.textOnDark} style={{ marginTop: spacing.lg }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{isStudent ? String(dashboardStats.activeCourses) : '—'}</Text>
              <Text style={styles.statLabel}>Cursos activos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{isStudent ? String(dashboardStats.average) : '—'}</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{isStudent ? String(dashboardStats.certificates) : '—'}</Text>
              <Text style={styles.statLabel}>Certificados</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.orangeRule} />

      <View style={[styles.body, { paddingHorizontal: layout.screenPadding }]}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeCareer]}>
            <Text style={styles.badgeCareerText}>{careerLabel}</Text>
          </View>
          <View style={[styles.badge, styles.badgeOk]}>
            <Text style={styles.badgeOkText}>Cuenta verificada</Text>
          </View>
        </View>

        <View style={styles.segmentCard}>
          <Text style={styles.segmentCardTitle}>Necesidades de tu segmento</Text>
          <Text style={styles.segmentCardBody}>{getSegmentNeedsLine(segment)}</Text>
        </View>

        {loadError ? <Text style={styles.bannerError}>{loadError}</Text> : null}
        {!isStudent ? (
          <Text style={styles.note}>
            {segment === 'docente' || segment === 'admin'
              ? 'Las herramientas para docentes y administración se conectarán al backend según el roadmap.'
              : segment === 'empresa'
                ? 'El portal empresarial requiere rol y endpoints específicos (en preparación).'
                : 'El detalle académico completo está disponible para cuentas con rol estudiante.'}
          </Text>
        ) : null}

        <SectionTitle>Información personal</SectionTitle>
        <Card>
          <MenuRow
            icon="mail-outline"
            title="Correo electrónico"
            subtitle={isStudent ? correoSub : user.username}
            onPress={() => (isStudent ? openPersonalDataEditor() : soon('Correo electrónico'))}
          />
          <View style={styles.menuSep} />
          <MenuRow
            icon="call-outline"
            title="Teléfono"
            subtitle={isStudent ? telSub : '—'}
            onPress={() => (isStudent ? openPersonalDataEditor() : soon('Teléfono'))}
          />
          <View style={styles.menuSep} />
          <MenuRow
            icon="lock-closed-outline"
            title="Seguridad y contraseña"
            subtitle={isStudent ? correoSub : user.username}
            onPress={() => (isStudent ? openPwModal() : soon('Seguridad y contraseña'))}
          />
          <View style={styles.menuSep} />
          <MenuRow
            icon="card-outline"
            title="Medios de pago"
            subtitle="Tarjeta de crédito…"
            onPress={() => soon('Medios de pago')}
          />
          {isStudent ? (
            <Text style={styles.inlineHint}>Toca correo o teléfono para editar tus datos personales.</Text>
          ) : null}
        </Card>

        <SectionTitle>Información académica</SectionTitle>
        <Card>
          <MenuRow
            icon="school-outline"
            title="Mis certificados"
            subtitle={isStudent ? `Tienes ${certCount} certificados` : 'Disponible para estudiantes'}
            onPress={() => soon('Mis certificados')}
          />
          <View style={styles.menuSep} />
          <MenuRow
            icon="ribbon-outline"
            title="Calificaciones"
            onPress={() => soon('Calificaciones')}
          />
        </Card>

        <SectionTitle>Opciones</SectionTitle>
        <Card>
          <MenuRow
            icon="notifications-outline"
            title="Notificaciones"
            subtitle="Preferencias de avisos"
            onPress={() => soon('Notificaciones')}
          />
          <View style={styles.menuSep} />
          <MenuRow icon="settings-outline" title="Configuraciones" onPress={() => soon('Configuraciones')} />
          <View style={styles.menuSep} />
          <MenuRow
            icon="help-circle-outline"
            title="Ayuda y soporte"
            subtitle="Contáctanos"
            onPress={() => soon('Ayuda y soporte')}
          />
        </Card>

        <Pressable style={styles.logoutBtn} onPress={() => logout()}>
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <Modal visible={editOpen} animationType="slide" transparent onRequestClose={closeEditModal}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeEditModal} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
            style={styles.modalKeyboard}
          >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar datos personales</Text>
              <Pressable onPress={closeEditModal} hitSlop={12} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={26} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.modalHint}>
              Teléfono RD (809/829/849); la fecha se elige con el calendario.
            </Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[styles.input, fieldErrors.nombre && styles.inputError]}
                value={draft?.nombre ?? ''}
                onChangeText={(t) => {
                  setDraft((d) => (d ? { ...d, nombre: t } : d));
                  setFieldErrors((fe) => ({ ...fe, nombre: undefined }));
                }}
                editable={!saving}
                autoCapitalize="words"
              />
              {fieldErrors.nombre ? <Text style={styles.fieldErr}>{fieldErrors.nombre}</Text> : null}

              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={[styles.input, fieldErrors.apellidos && styles.inputError]}
                value={draft?.apellidos ?? ''}
                onChangeText={(t) => {
                  setDraft((d) => (d ? { ...d, apellidos: t } : d));
                  setFieldErrors((fe) => ({ ...fe, apellidos: undefined }));
                }}
                editable={!saving}
                autoCapitalize="words"
              />
              {fieldErrors.apellidos ? <Text style={styles.fieldErr}>{fieldErrors.apellidos}</Text> : null}

              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={[styles.input, fieldErrors.correo && styles.inputError]}
                value={draft?.correo ?? ''}
                onChangeText={(t) => {
                  setDraft((d) => (d ? { ...d, correo: t } : d));
                  setFieldErrors((fe) => ({ ...fe, correo: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
              {fieldErrors.correo ? <Text style={styles.fieldErr}>{fieldErrors.correo}</Text> : null}

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[styles.input, fieldErrors.telefono && styles.inputError]}
                value={formatPhoneRdDisplay(draft?.telefono ?? '')}
                onChangeText={(t) => {
                  const digits = normalizePhoneRd(t);
                  setDraft((d) => (d ? { ...d, telefono: digits } : d));
                  setFieldErrors((fe) => ({ ...fe, telefono: undefined }));
                }}
                keyboardType="phone-pad"
                placeholder="809-123-4567"
                placeholderTextColor={colors.textMuted}
                editable={!saving}
                maxLength={12}
              />
              {fieldErrors.telefono ? <Text style={styles.fieldErr}>{fieldErrors.telefono}</Text> : null}

              <Text style={styles.label}>Fecha de nacimiento</Text>
              <BirthDatePickerField
                value={draft?.fechaNacimiento ?? ''}
                onChange={(ddMmYyyy) => {
                  setDraft((d) => (d ? { ...d, fechaNacimiento: ddMmYyyy } : d));
                  setFieldErrors((fe) => ({ ...fe, fechaNacimiento: undefined }));
                }}
                hasError={Boolean(fieldErrors.fechaNacimiento)}
                disabled={saving}
                placeholder="dd-MM-yyyy"
              />
              {fieldErrors.fechaNacimiento ? (
                <Text style={styles.fieldErr}>{fieldErrors.fechaNacimiento}</Text>
              ) : null}

              <Text style={styles.label}>Dirección (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, fieldErrors.direccion && styles.inputError]}
                value={draft?.direccion ?? ''}
                onChangeText={(t) => {
                  setDraft((d) => (d ? { ...d, direccion: t } : d));
                  setFieldErrors((fe) => ({ ...fe, direccion: undefined }));
                }}
                multiline
                textAlignVertical="top"
                editable={!saving}
              />
              {fieldErrors.direccion ? <Text style={styles.fieldErr}>{fieldErrors.direccion}</Text> : null}

              {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={closeEditModal} disabled={saving}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalSave, saving && styles.buttonDisabled]}
                onPress={() => void onSave()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text style={styles.modalSaveText}>Guardar cambios</Text>
                )}
              </Pressable>
            </View>
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={pwModalOpen} animationType="slide" transparent onRequestClose={closePwModal}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closePwModal} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cambiar contraseña</Text>
                <Pressable onPress={closePwModal} hitSlop={12} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={26} color={colors.textMuted} />
                </Pressable>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                <Text style={styles.label}>Contraseña actual</Text>
                <TextInput
                  style={styles.input}
                  value={pwCurrent}
                  onChangeText={setPwCurrent}
                  secureTextEntry
                  editable={!pwLoading}
                />

                <Text style={styles.label}>Nueva contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={pwNew}
                  onChangeText={setPwNew}
                  secureTextEntry
                  editable={!pwLoading}
                />

                <Text style={styles.label}>Confirmar nueva contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={pwConfirm}
                  onChangeText={setPwConfirm}
                  secureTextEntry
                  editable={!pwLoading}
                />

                {pwError ? <Text style={styles.error}>{pwError}</Text> : null}
              </ScrollView>
              <View style={styles.modalActions}>
                <Pressable style={styles.modalCancel} onPress={closePwModal} disabled={pwLoading}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSave, pwLoading && styles.buttonDisabled]}
                  onPress={() => void onSavePassword()}
                  disabled={pwLoading}
                >
                  {pwLoading ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.modalSaveText}>Guardar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: spacing.xxxl },
  scrollGuest: { flexGrow: 1, paddingBottom: spacing.xxxl },
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.textOnDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.heroNavy,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  heroName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
    textAlign: 'center',
  },
  heroId: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  heroGuestHint: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.textOnDark,
  },
  statLabel: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  orangeRule: {
    height: 3,
    backgroundColor: colors.accent,
    width: '100%',
  },
  body: {
    paddingTop: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  badgeCareer: { backgroundColor: '#FFF8E1' },
  badgeCareerText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#5d4037',
  },
  badgeOk: { backgroundColor: '#E8F5E9' },
  badgeOkText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#1b5e20',
  },
  segmentCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentCardTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  segmentCardBody: {
    fontSize: typography.size.sm,
    color: colors.text,
    lineHeight: typography.lineHeight.relaxed,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuRowPressed: { backgroundColor: colors.surfaceMuted },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.chipBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: { flex: 1, minWidth: 0 },
  menuTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  menuSubtitle: {
    marginTop: 2,
    fontSize: typography.size.sm,
    color: colors.textMuted,
  },
  inlineHint: {
    fontSize: typography.size.xs,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    lineHeight: 18,
  },
  menuSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 44 + spacing.md,
  },
  note: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.relaxed,
  },
  bannerError: {
    padding: spacing.md,
    backgroundColor: '#ffebee',
    color: colors.error,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    fontSize: typography.size.sm,
  },
  logoutBtn: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: '#ffeaeb',
    borderWidth: 1,
    borderColor: '#ff4c4c',
  },
  logoutBtnText: {
    color: '#ff3030',
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
  },
  guestBody: { marginTop: spacing.lg, flex: 1 },
  guestCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
    marginBottom: spacing.md,
  },
  guestText: {
    fontSize: typography.size.md,
    color: colors.textMuted,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    backgroundColor: colors.heroNavy,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.body,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.link,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.md,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: typography.size.body,
    backgroundColor: colors.card,
  },
  error: { color: colors.error, marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.7 },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalKeyboard: {
    width: '100%',
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalHint: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  fieldErr: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  inputError: { borderColor: colors.error },
  inputMultiline: { minHeight: 80, paddingTop: 12 },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: layout.screenPadding,
    paddingTop: layout.screenPadding,
    maxHeight: '92%',
  },
  modalScroll: {
    paddingBottom: spacing.md,
  },
  modalTitle: {
    flex: 1,
    paddingRight: spacing.md,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.heroNavy,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalCancel: { paddingVertical: 12, paddingHorizontal: spacing.md },
  modalCancelText: { color: colors.textMuted, fontWeight: typography.weight.semibold, fontSize: typography.size.md },
  modalSave: {
    backgroundColor: colors.heroNavy,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    minWidth: 100,
    alignItems: 'center',
  },
  modalSaveText: { color: colors.onPrimary, fontWeight: typography.weight.bold, fontSize: typography.size.md },
});
