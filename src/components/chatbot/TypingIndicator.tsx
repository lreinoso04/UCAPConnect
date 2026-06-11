// import {useEffect} from 'react';
// import { View, StyleSheet } from 'react-native';
// import Animated, {
//   useAnimatedStyle,
//   withRepeat,
//   withTiming,
//   withSequence,
//   withDelay,
//   useSharedValue,
// } from 'react-native-reanimated';

// const DOT_COUNT = 3;
// const DOT_SIZE = 8;
// const ANIMATION_DURATION = 400;
// const DELAY_BETWEEN_DOTS = 150;

// function TypingDot({ delay }: { delay: number }) {
//   const opacity = useSharedValue(0.3);

//   useEffect(() => {
//     opacity.value = withDelay(
//       delay,
//       withRepeat(
//         withSequence(
//           withTiming(1, { duration: ANIMATION_DURATION }),
//           withTiming(0.3, { duration: ANIMATION_DURATION })
//         ),
//         -1,
//         false
//       )
//     );
//   }, [delay, opacity]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//   }));

//   return <Animated.View style={[styles.dot, animatedStyle]} />;
// }

// export function TypingIndicator() {
//   return (
//     <View style={styles.container}>
//       <View style={styles.bubble}>
//         {Array.from({ length: DOT_COUNT }, (_, index) => (
//           <TypingDot key={index} delay={index * DELAY_BETWEEN_DOTS} />
//         ))}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     alignSelf: 'flex-start',
//     marginVertical: 4,
//     marginLeft: 12,
//   },
//   bubble: {
//     backgroundColor: '#E8E8E8',
//     borderRadius: 18,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   dot: {
//     width: DOT_SIZE,
//     height: DOT_SIZE,
//     borderRadius: DOT_SIZE / 2,
//     backgroundColor: '#666',
//   },
// });

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