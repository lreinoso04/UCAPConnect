import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
    Animated,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 375;

interface ChatBubbleProps {
    onClose: () => void;
    onOpenChat: () => void;
}

export function ChatBubble({
    onClose,
    onOpenChat,
}: ChatBubbleProps) {
    const scaleAnim = React.useRef(
        new Animated.Value(0.95)
    ).current;

    const opacityAnim = React.useRef(
        new Animated.Value(0)
    ).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
            >
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.95}
                onPress={onOpenChat}
                style={styles.contentTouchable}
            >
                <View style={styles.header}>
                    <Image
                        source={require('../../../assets/logo-cap-light.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.bodyContent}>
                    <Text style={styles.title}>
                        ¡Hola! Soy UCAPBot
                    </Text>

                    <View style={styles.statusContainer}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.statusText}>
                            Online • Listo para ayudarte
                        </Text>
                    </View>

                    <Text style={styles.description}>
                        Estoy aquí para ayudarte con cursos,
                        diplomados, certificaciones,
                        inscripciones y horarios.
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.arrow} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: IS_SMALL_SCREEN ? 280 : 310,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,

        elevation: 12,
    },

    closeButton: {
        position: 'absolute',
        top: 18,
        right: 18,
        zIndex: 999,
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },

    closeText: {
        fontSize: 22,
        color: '#9CA3AF',
        fontWeight: '500',
    },

    contentTouchable: {
        paddingBottom: 20,
    },

    header: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 1,
    },

    bodyContent: {
        paddingHorizontal: 18,
        paddingBottom: 0,
    },

    logo: {
        width: 180,
        height: 45,
    },

    title: {
        fontSize: IS_SMALL_SCREEN ? 20 : 24,
        fontWeight: '700',
        color: '#001B5E',
        marginBottom: 5,
    },

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },

    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 5,
        backgroundColor: '#22C55E',
        marginRight: 8,
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16A34A',
    },

    description: {
        fontSize: 14,
        lineHeight: 22,
        color: '#4B5563',
    },

    arrow: {
        position: 'absolute',
        bottom: -8,
        right: 35,

        width: 16,
        height: 16,

        backgroundColor: '#FFFFFF',

        transform: [{ rotate: '45deg' }],
    },
});