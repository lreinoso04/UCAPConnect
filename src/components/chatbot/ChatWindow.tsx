import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;
const IS_IOS = Platform.OS === 'ios';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  error?: boolean;
}

interface ChatWindowProps {
  visible?: boolean;
  messages: Message[];
  isLoading: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
}

export function ChatWindow({
  visible = true,
  messages,
  isLoading,
  onClose,
  onSendMessage,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

 useEffect(() => {
  if (visible) {
    setShouldRender(true);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  } else {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false);
    });
  }
}, [visible]);

useEffect(() => {
  const showSub = Keyboard.addListener('keyboardDidShow', () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  });

  return () => {
    showSub.remove();
  };
}, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) {
      return;
    }

    const message = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    
    try {
      await onSendMessage(message);
    } catch (error) {
    }
  };

  const handleSubmit = async () => {
    await handleSend();
  };

  const quickActions = [
    { id: '1', label: 'Cursos', icon: 'book-outline' },
    { id: '2', label: 'Inscripciones', icon: 'document-text-outline' },
    { id: '3', label: 'Certificados', icon: 'ribbon-outline' },
    { id: '4', label: 'Horarios', icon: 'time-outline' },
  ];

 if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={IS_IOS ? 'padding' : 'height'}
          keyboardVerticalOffset={IS_IOS ? 0 : 20}
        >
          <Animated.View
            style={[
              styles.windowContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <View style={styles.botIcon}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>UCAPBOT</Text>
                    <View style={styles.statusRow}>
                      <View style={styles.statusDot} />
                      <Text style={styles.headerSubtitle}>Online - Listo para ayudarte</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              overScrollMode="never"
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="sparkles" size={40} color="#F97316" />
                  </View>
                  <Text style={styles.emptyTitle}>Bienvenido!</Text>
                  <Text style={styles.emptySubtitle}>
                    Soy tu asistente virtual. Selecciona una opcion o escribe tu consulta.
                  </Text>

                  {/* Quick actions */}
                  <View style={styles.quickActionsContainer}>
                    {quickActions.map((action) => (
                      <TouchableOpacity
                        key={action.id}
                        style={styles.quickAction}
                        onPress={() => {
                          onSendMessage(action.label);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={action.icon as any} size={18} color="#001B5E" />
                        <Text style={styles.quickActionText}>{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isLoading && <TypingIndicator />}
                </>
              )}
            </ScrollView>

            {/* Input area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Escribe tu mensaje..."
                  placeholderTextColor="#9CA3AF"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  editable={!isLoading}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                <Text style={styles.charCounter}>{inputText.length}/500</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="send"
                  size={22}
                  color={inputText.trim() && !isLoading ? '#FFFFFF' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>Disponible las 24 horas</Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  windowContainer: {
    height: '80%',
    maxHeight: 650,
  minHeight: 500,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    backgroundColor: '#001B5E',
    paddingTop: IS_IOS ? 16 : 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  botIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerInfo: {
    gap: 4,
  },
  headerTitle: {
    fontSize: IS_SMALL_SCREEN ? 18 : 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerSubtitle: {
    fontSize: IS_SMALL_SCREEN ? 12 : 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFEDD5',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001B5E',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingRight: 60,
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCounter: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontSize: 11,
    color: '#9CA3AF',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#001B5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#001B5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
});
