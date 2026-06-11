import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@/types/chat';
import Ionicons from '@expo/vector-icons/build/Ionicons';
// import { User, Bot } from 'lucide-react-native';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={styles.messageRow}>
        {!isUser && (
          <View style={styles.avatar}>
           <Ionicons name="person" size={18} color="#fff" />
          </View>
        )}
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
        {isUser && (
          <View style={[styles.avatar, styles.userAvatar]}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        )}
      </View>
      <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
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
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: '#FF8300',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#FF8300',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#1F2937',
  },
  errorText: {
    color: '#DC2626',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  userTimestamp: {
    textAlign: 'right',
    marginRight: 40,
    color: '#6B7280',
  },
  assistantTimestamp: {
    textAlign: 'left',
    marginLeft: 40,
    color: '#6B7280',
  },
});
