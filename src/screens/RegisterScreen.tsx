import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BirthDatePickerField } from '../components/BirthDatePickerField';
import { useAuth } from '../context/AuthContext';
import { ApiException } from '../api/client';
import type { AuthStackParamList } from '../navigation/types';
import type { EstudianteProfile } from '../types/api';
import { colors, layout, radius, spacing, typography } from '../theme';
import { formatPhoneRdDisplay } from '../utils/inputFormat';
import {
  hasRegisterErrors,
  normalizePhoneRd,
  validateRegisterForm,
  type RegisterFormErrors,
} from '../utils/profileValidation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});

  const apellidosRef = useRef<TextInput>(null);
  const correoRef = useRef<TextInput>(null);
  const telefonoRef = useRef<TextInput>(null);
  const direccionRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  function clearField<K extends keyof RegisterFormErrors>(key: K) {
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setError(null);
  }

  async function onSubmit() {
    setError(null);
    const profile: EstudianteProfile = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim(),
      telefono: normalizePhoneRd(telefono),
      direccion: direccion.trim(),
      fechaNacimiento: fechaNacimiento.trim(),
    };
    const errs = validateRegisterForm(profile, username, password);
    if (hasRegisterErrors(errs)) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await register({
        ...profile,
        telefono: normalizePhoneRd(telefono),
        username: username.trim(),
        password,
      });
      Alert.alert('Registro exitoso', 'Hemos enviado un correo de verificación a tu cuenta.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      const msg =
        e instanceof ApiException
          ? e.message
          : e instanceof Error
            ? e.message
            : 'No se pudo registrar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Crear cuenta estudiante</Text>
        <Text style={styles.hint}>Mismas reglas que el perfil: teléfono RD; fecha con calendario.</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[styles.input, fieldErrors.nombre && styles.inputErr]}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          value={nombre}
          onChangeText={(t) => { setNombre(t); clearField('nombre'); }}
          autoCapitalize="words"
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => apellidosRef.current?.focus()}
          blurOnSubmit={false}
        />
        {fieldErrors.nombre ? <Text style={styles.fieldErr}>{fieldErrors.nombre}</Text> : null}

        <Text style={styles.label}>Apellidos</Text>
        <TextInput
          ref={apellidosRef}
          style={[styles.input, fieldErrors.apellidos && styles.inputErr]}
          placeholder="Apellidos"
          placeholderTextColor={colors.textMuted}
          value={apellidos}
          onChangeText={(t) => { setApellidos(t); clearField('apellidos'); }}
          autoCapitalize="words"
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => correoRef.current?.focus()}
          blurOnSubmit={false}
        />
        {fieldErrors.apellidos ? <Text style={styles.fieldErr}>{fieldErrors.apellidos}</Text> : null}

        <Text style={styles.label}>Correo</Text>
        <TextInput
          ref={correoRef}
          style={[styles.input, fieldErrors.correo && styles.inputErr]}
          placeholder="correo@dominio.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={correo}
          onChangeText={(t) => { setCorreo(t); clearField('correo'); }}
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => telefonoRef.current?.focus()}
          blurOnSubmit={false}
        />
        {fieldErrors.correo ? <Text style={styles.fieldErr}>{fieldErrors.correo}</Text> : null}

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          ref={telefonoRef}
          style={[styles.input, fieldErrors.telefono && styles.inputErr]}
          placeholder="809-123-4567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={formatPhoneRdDisplay(telefono)}
          onChangeText={(t) => { setTelefono(normalizePhoneRd(t)); clearField('telefono'); }}
          maxLength={12}
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => direccionRef.current?.focus()}
          blurOnSubmit={false}
        />
        {fieldErrors.telefono ? <Text style={styles.fieldErr}>{fieldErrors.telefono}</Text> : null}

        <Text style={styles.label}>Dirección (opcional)</Text>
        <TextInput
          ref={direccionRef}
          style={[styles.input, styles.inputMulti, fieldErrors.direccion && styles.inputErr]}
          placeholder="Calle, sector…"
          placeholderTextColor={colors.textMuted}
          value={direccion}
          onChangeText={(t) => { setDireccion(t); clearField('direccion'); }}
          multiline
          textAlignVertical="top"
          editable={!loading}
          returnKeyType="next"
          blurOnSubmit={true}
          onSubmitEditing={() => usernameRef.current?.focus()}
        />
        {fieldErrors.direccion ? <Text style={styles.fieldErr}>{fieldErrors.direccion}</Text> : null}

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <BirthDatePickerField
          value={fechaNacimiento}
          onChange={(v) => {
            setFechaNacimiento(v);
            clearField('fechaNacimiento');
          }}
          hasError={Boolean(fieldErrors.fechaNacimiento)}
          disabled={loading}
          placeholder="Seleccionar fecha"
          containerStyle={styles.dateField}
        />
        {fieldErrors.fechaNacimiento ? (
          <Text style={styles.fieldErr}>{fieldErrors.fechaNacimiento}</Text>
        ) : null}

        <Text style={styles.label}>Usuario</Text>
        <TextInput
          ref={usernameRef}
          style={[styles.input, fieldErrors.username && styles.inputErr]}
          placeholder="Usuario para iniciar sesión"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={(t) => { setUsername(t); clearField('username'); }}
          editable={!loading}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
        />
        {fieldErrors.username ? <Text style={styles.fieldErr}>{fieldErrors.username}</Text> : null}

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          ref={passwordRef}
          style={[styles.input, fieldErrors.password && styles.inputErr]}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={(t) => { setPassword(t); clearField('password'); }}
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={() => void onSubmit()}
        />
        {fieldErrors.password ? <Text style={styles.fieldErr}>{fieldErrors.password}</Text> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={() => void onSubmit()} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} disabled={loading} style={styles.linkWrap}>
          <Text style={styles.link}>Volver al inicio de sesión</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  hint: { fontSize: typography.size.sm, color: colors.textMuted, marginBottom: spacing.xl, lineHeight: 20 },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.size.body,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
    color: colors.text,
  },
  inputMulti: { minHeight: 72, paddingTop: 12 },
  dateField: { borderRadius: radius.md, marginBottom: spacing.xs },
  inputErr: { borderColor: colors.error },
  fieldErr: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.onPrimary, fontSize: typography.size.body, fontWeight: typography.weight.bold },
  error: { color: colors.error, marginBottom: spacing.sm, fontSize: typography.size.sm },
  linkWrap: { marginTop: spacing.lg, alignItems: 'center' },
  link: { color: colors.interactiveBlue, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
});
