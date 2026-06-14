import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  error?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-DO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isUser]);

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={[styles.messageRow, isUser && styles.messageRowReverse]}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            isUser ? styles.userAvatar : styles.assistantAvatar,
          ]}
        >
          <Ionicons
            name={isUser ? 'person' : 'sparkles'}
            size={16}
            color="#FFFFFF"
          />
        </View>

        {/* Bubble */}
        <View style={styles.bubbleWrapper}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.assistantBubble,
              message.error && styles.errorBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userText : styles.assistantText,
                message.error && styles.errorText,
              ]}
            >
              {message.content}
            </Text>
          </View>

          {/* Timestamp */}
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    maxWidth: '90%',
    minHeight: 50,
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  messageRowReverse: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    backgroundColor: '#F97316',
  },
  assistantAvatar: {
    backgroundColor: '#6B7280',
  },
  bubbleWrapper: {
    maxWidth: SCREEN_WIDTH * 0.7,
    gap: 4,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#F97316',
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  messageText: {
    fontSize: IS_SMALL_SCREEN ? 14 : 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assistantText: {
    color: '#1F2937',
  },
  errorText: {
    color: '#DC2626',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  assistantTimestamp: {
    textAlign: 'left',
  },
});
