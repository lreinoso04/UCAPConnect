import { View, TouchableOpacity, StyleSheet, Platform, Text, Animated } from 'react-native';
import { useChat } from '@/context/ChatContext';
import { ChatWindow } from './ChatWindow';
import { useRef } from 'react';
import {colors} from '@/theme';

export function ChatButton() {
  console.log("Chatbutton cargando");

  const { isOpen, toggleChat, closeChat } = useChat();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 90,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    toggleChat();
  };

  const animatedButtonStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const animatedIconStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 90],
          outputRange: ['0deg', '90deg'],
        }),
      },
    ],
  };

  return (
    <>
      {isOpen && <ChatWindow onClose={closeChat} />}
      <View style={styles.container}>
        <Animated.View style={[styles.button, animatedButtonStyle]}>
          <TouchableOpacity
            style={styles.buttonInner}
            onPress={handlePress}
            activeOpacity={0.9}
          >
            <Animated.Text style={[styles.icon, animatedIconStyle]}>
              {isOpen ? '✕' : '💬'}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 24 : 80,
    right: 16,
    zIndex: 999,
    elevation: 5,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 26,
    fontWeight: '600',
  },
});
