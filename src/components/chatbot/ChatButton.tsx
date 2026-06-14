import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

import { ChatBubble } from './ChatBubble';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;
const BUTTON_SIZE = IS_SMALL_SCREEN ? 56 : 64;

interface ChatButtonProps {
  isOpen: boolean;
  isLoading?: boolean;
  onToggle: () => void;
}

export function ChatButton({
  isOpen,
  isLoading,
  onToggle,
}: ChatButtonProps) {
  const [showBubble, setShowBubble] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bubbleShownRef = useRef(false);
  const notificationPulse = useRef(
    new Animated.Value(1)
  ).current;

  const pulseLoopRef =
    useRef<Animated.CompositeAnimation | null>(null);

  const notifLoopRef =
    useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (pulseLoopRef.current) {
      pulseLoopRef.current.stop();
      pulseLoopRef.current = null;
    }

    if (notifLoopRef.current) {
      notifLoopRef.current.stop();
      notifLoopRef.current = null;
    }

    if (!isOpen) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();
      pulseLoopRef.current = pulse;

      const notifPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(notificationPulse, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(notificationPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      notifPulse.start();
      notifLoopRef.current = notifPulse;
    } else {
      pulseAnim.setValue(1);
      notificationPulse.setValue(1);
    }

    return () => {
      pulseLoopRef.current?.stop();
      notifLoopRef.current?.stop();
    };
  }, [isOpen]);

 useEffect(() => {
  if (!isOpen && !bubbleShownRef.current) {
    const timer = setTimeout(() => {
      setShowBubble(true);
      bubbleShownRef.current = true;
    }, 2000);

    return () => clearTimeout(timer);
  }
}, []);

  const handlePress = () => {
    const sequence = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]);

    sequence.start();

    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    setShowBubble(false);
    onToggle();
  };

  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {!isOpen && showBubble && (
        <View style={styles.bubbleWrapper}>
          <ChatBubble
            onClose={() => setShowBubble(false)}
            onOpenChat={() => {
              setShowBubble(false);
              handlePress();
            }}
          />
        </View>
      )}

      {!isOpen && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isOpen && styles.buttonOpen,
          ]}
          onPress={handlePress}
          activeOpacity={0.9}
          hitSlop={{
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <Animated.View
            style={{
              transform: [{ rotate: iconRotation }],
            }}
          >
            <Text style={styles.icon}>
              {isOpen ? '✕' : '💬'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {!isOpen && (
        <View style={styles.notificationDot}>
          <Animated.View
            style={[
              styles.notificationPulse,
              {
                transform: [
                  { scale: notificationPulse },
                ],
                opacity:
                  notificationPulse.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.8, 0],
                  }),
              },
            ]}
          />

          <View style={styles.notificationInner} />
        </View>
      )}

      {isLoading && !isOpen && (
        <View style={styles.loadingBadge}>
          <Text style={styles.loadingText}>
            ...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  position: 'absolute',
  bottom: Platform.OS === 'ios' ? 65 : 85,
  right: 20,
  zIndex: 999,
  alignItems: 'flex-end',
},

  bubbleWrapper: {
    position: 'absolute',
    bottom: BUTTON_SIZE + 15,
    right: -10,
    zIndex: 1001,
  },

  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#001B5E',
    opacity: 0.3,
  },

  buttonWrapper: {
    shadowColor: '#001B5E',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#001B5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  buttonOpen: {
    backgroundColor: '#404040',
  },

  icon: {
    fontSize: IS_SMALL_SCREEN ? 26 : 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationPulse: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F97316',
  },

  notificationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  loadingBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#001B5E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  loadingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});