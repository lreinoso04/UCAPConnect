// Este sera temporar hasta que se le agrege el endpoint
import { View, Text, StyleSheet } from 'react-native';

export function TypingIndicator() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🤖 Escribiendo...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  text: {
    color: '#666',
    fontStyle: 'italic',
  },
});