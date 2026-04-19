import { useEffect, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { formatDdMmYyyy, parseDdMmYyyy } from '../utils/inputFormat';

type Props = {
  value: string;
  onChange: (ddMmYyyy: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

const DEFAULT_DATE = new Date(2000, 0, 15);

export function BirthDatePickerField({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled,
  hasError,
  containerStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [showIos, setShowIos] = useState(false);
  const [iosTemp, setIosTemp] = useState(DEFAULT_DATE);

  const parsed = parseDdMmYyyy(value);
  const displayDate = parsed ?? DEFAULT_DATE;

  useEffect(() => {
    if (showIos) {
      const d = parseDdMmYyyy(value);
      setIosTemp(d ?? DEFAULT_DATE);
    }
  }, [showIos, value]);

  function open() {
    if (disabled) return;

    if (Platform.OS === 'android') {
      void DateTimePickerAndroid.open({
        value: displayDate,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) {
            onChange(formatDdMmYyyy(date));
          }
        },
      });
      return;
    }

    setShowIos(true);
  }

  function confirmIos() {
    onChange(formatDdMmYyyy(iosTemp));
    setShowIos(false);
  }

  const iosSheetMinHeight = Math.min(420, Math.max(260, windowHeight * 0.38));

  return (
    <>
      <Pressable
        style={[
          styles.field,
          hasError && styles.fieldErr,
          disabled && styles.fieldDisabled,
          containerStyle,
        ]}
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value.trim() ? `Fecha de nacimiento ${value}` : placeholder}
      >
        <Text style={[styles.fieldText, !value?.trim() && styles.placeholder]} numberOfLines={1}>
          {value.trim() ? value : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={colors.textMuted} />
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showIos}
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          statusBarTranslucent
          onRequestClose={() => setShowIos(false)}
        >
          <View style={[styles.iosBackdrop, { paddingBottom: insets.bottom }]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={() => setShowIos(false)}
            />
            <View style={[styles.iosSheet, { minHeight: iosSheetMinHeight }]}>
              <View style={styles.iosToolbar}>
                <Pressable onPress={() => setShowIos(false)} hitSlop={12}>
                  <Text style={styles.iosLink}>Cancelar</Text>
                </Pressable>
                <Text style={styles.iosTitle} numberOfLines={1}>
                  Fecha de nacimiento
                </Text>
                <Pressable onPress={confirmIos} hitSlop={12}>
                  <Text style={styles.iosLinkBold}>Listo</Text>
                </Pressable>
              </View>
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={iosTemp}
                  mode="date"
                  display="spinner"
                  onChange={(_, d) => d && setIosTemp(d)}
                  maximumDate={new Date()}
                  themeVariant="light"
                  textColor={colors.text}
                  style={styles.iosPicker}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  fieldErr: { borderColor: colors.error },
  fieldDisabled: { opacity: 0.6 },
  fieldText: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text,
  },
  placeholder: { color: colors.textMuted },
  iosBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  iosSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  iosToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  iosTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textMuted,
  },
  iosLink: { fontSize: typography.size.md, color: colors.interactiveBlue },
  iosLinkBold: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.interactiveBlue },
  iosPickerWrap: {
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'center',
    minHeight: 216,
  },
  iosPicker: {
    width: '100%',
    height: 216,
  },
});
