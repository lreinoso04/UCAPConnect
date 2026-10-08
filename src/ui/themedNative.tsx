import React, { forwardRef } from 'react';
import * as Native from 'react-native';

import { usePreferences, translate } from '../i18n/preferences';
import { darkColor } from '../theme';

export * from 'react-native';
export const StyleSheet = Native.StyleSheet as typeof Native.StyleSheet & {
  absoluteFillObject: { position: 'absolute'; top: 0; right: 0; bottom: 0; left: 0 };
};

function adaptStyle<T>(style: T, dark: boolean): T {
  if (!dark || !style) return style;
  const flat = Native.StyleSheet.flatten(style as Native.StyleProp<Native.ViewStyle>);
  if (!flat) return style;
  const result: Record<string, unknown> = { ...flat };
  for (const [property, value] of Object.entries(result)) {
    if (typeof value === 'string') result[property] = darkColor(value, property);
  }
  return result as T;
}

function translateChildren(children: React.ReactNode, language: 'es' | 'en'): React.ReactNode {
  if (language === 'es') return children;
  if (typeof children === 'string') return translate(children);
  if (Array.isArray(children)) return children.map((child) => translateChildren(child, language));
  return children;
}

export const View = forwardRef<Native.View, Native.ViewProps>(function ThemedView({ style, ...props }, ref) {
  const { dark } = usePreferences();
  return <Native.View {...props} ref={ref} style={adaptStyle(style, dark)} />;
});
export type View = Native.View;

export const Text = forwardRef<Native.Text, Native.TextProps>(function ThemedText({ style, children, accessibilityLabel, ...props }, ref) {
  const { dark, language } = usePreferences();
  return <Native.Text {...props} ref={ref} style={adaptStyle(style, dark)} accessibilityLabel={accessibilityLabel ? translate(accessibilityLabel) : undefined}>{translateChildren(children, language)}</Native.Text>;
});
export type Text = Native.Text;

export const TextInput = forwardRef<Native.TextInput, Native.TextInputProps>(function ThemedTextInput({ style, placeholder, placeholderTextColor, ...props }, ref) {
  const { dark } = usePreferences();
  return <Native.TextInput {...props} ref={ref} style={adaptStyle(style, dark)} placeholder={placeholder ? translate(placeholder) : undefined} placeholderTextColor={dark && typeof placeholderTextColor === 'string' ? darkColor(placeholderTextColor, 'placeholderTextColor') : placeholderTextColor} />;
});
export type TextInput = Native.TextInput;

export const ScrollView = forwardRef<Native.ScrollView, Native.ScrollViewProps>(function ThemedScrollView({ style, contentContainerStyle, ...props }, ref) {
  const { dark } = usePreferences();
  return <Native.ScrollView {...props} ref={ref} style={adaptStyle(style, dark)} contentContainerStyle={adaptStyle(contentContainerStyle, dark)} />;
});
export type ScrollView = Native.ScrollView;

export const Pressable = forwardRef<Native.View, Native.PressableProps>(function ThemedPressable({ style, ...props }, ref) {
  const { dark } = usePreferences();
  const themedStyle: Native.PressableProps['style'] = typeof style === 'function'
    ? (state) => adaptStyle(style(state), dark)
    : adaptStyle(style, dark);
  return <Native.Pressable {...props} ref={ref} style={themedStyle} />;
});

export const TouchableOpacity = forwardRef<React.ElementRef<typeof Native.TouchableOpacity>, Native.TouchableOpacityProps>(function ThemedTouchableOpacity({ style, ...props }, ref) {
  const { dark } = usePreferences();
  return <Native.TouchableOpacity {...props} ref={ref} style={adaptStyle(style, dark)} />;
});
export type TouchableOpacity = React.ElementRef<typeof Native.TouchableOpacity>;

export const KeyboardAvoidingView = forwardRef<Native.KeyboardAvoidingView, Native.KeyboardAvoidingViewProps>(function ThemedKeyboardAvoidingView({ style, contentContainerStyle, ...props }, ref) {
  const { dark } = usePreferences();
  return <Native.KeyboardAvoidingView {...props} ref={ref} style={adaptStyle(style, dark)} contentContainerStyle={adaptStyle(contentContainerStyle, dark)} />;
});

export function ActivityIndicator(props: Native.ActivityIndicatorProps) {
  const { dark } = usePreferences();
  return <Native.ActivityIndicator {...props} style={adaptStyle(props.style, dark)} color={dark && typeof props.color === 'string' ? darkColor(props.color, 'color') : props.color} />;
}

export const Alert = {
  ...Native.Alert,
  alert(title: string, message?: string, buttons?: Parameters<typeof Native.Alert.alert>[2], options?: Parameters<typeof Native.Alert.alert>[3]) {
    Native.Alert.alert(
      translate(title),
      message ? translate(message) : undefined,
      buttons?.map((button) => ({ ...button, text: button.text ? translate(button.text) : button.text })),
      options,
    );
  },
} as typeof Native.Alert;
