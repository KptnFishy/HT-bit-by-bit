import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SwipeButtonProps {
    text: string;
    onSwipeSuccess: () => void;
    sliderColor?: string;
    containerColor?: string;
    textColor?: string;
    direction?: 'right' | 'left';
    pulseEffect?: boolean;
}

const BUTTON_WIDTH = Dimensions.get('window').width - 40; // 20px padding both sides
const THUMB_SIZE = 60;
const THUMB_PADDING = 5;
const MAX_TRANSLATE = BUTTON_WIDTH - THUMB_SIZE - (THUMB_PADDING * 2);

export const SwipeButton = ({
    text,
    onSwipeSuccess,
    sliderColor = '#22d3ee', // primary
    containerColor = '#131b2e', // surface container
    textColor = '#9ca3af',
    direction = 'right',
    pulseEffect = true
}: SwipeButtonProps) => {
    const pan = useRef(new Animated.Value(0)).current;
    const [swiped, setSwiped] = useState(false);
    
    // Wave Animation 
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (pulseEffect && !swiped) {
            Animated.loop(
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: false, // Scale/Opacity can use native, but RN web sometimes struggles with absolute native loops
                })
            ).start();
        } else {
            waveAnim.setValue(0);
            waveAnim.stopAnimation();
        }
    }, [pulseEffect, swiped]);

    let isLeft = direction === 'left';

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !swiped,
            onMoveShouldSetPanResponder: () => !swiped,
            onPanResponderMove: (e, gestureState) => {
                if (swiped) return;
                
                let newValue = 0;
                if (direction === 'right') {
                    newValue = Math.max(0, Math.min(gestureState.dx, MAX_TRANSLATE));
                } else {
                    newValue = Math.max(-MAX_TRANSLATE, Math.min(gestureState.dx, 0));
                }
                pan.setValue(newValue);
            },
            onPanResponderRelease: (e, gestureState) => {
                if (swiped) return;

                const threshold = direction === 'right' ? MAX_TRANSLATE * 0.75 : -MAX_TRANSLATE * 0.75;
                const isSuccessful = direction === 'right' ? gestureState.dx > threshold : gestureState.dx < threshold;

                if (isSuccessful) {
                    setSwiped(true);
                    Animated.spring(pan, {
                        toValue: direction === 'right' ? MAX_TRANSLATE : -MAX_TRANSLATE,
                        useNativeDriver: false,
                        bounciness: 0,
                    }).start(() => {
                        onSwipeSuccess();
                        // Self reset just in case parent keeps it mounted
                        setTimeout(() => {
                            setSwiped(false);
                            pan.setValue(0);
                        }, 500);
                    });
                } else {
                    Animated.spring(pan, {
                        toValue: 0,
                        useNativeDriver: false,
                        bounciness: 10,
                    }).start();
                }
            }
        })
    ).current;

    const animatedStyles = {
        transform: [{ translateX: pan }]
    };
    
    // Calculate Wave Styles for Container
    const waveScaleX = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05] // Subtle width expansion
    });
    const waveScaleY = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3] // Larger height expansion
    });
    const waveOpacity = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 0]
    });

    const thumbIcon = isLeft ? 'chevron-left' : 'chevron-right';

    return (
        <View style={{ width: BUTTON_WIDTH, height: THUMB_SIZE + (THUMB_PADDING * 2), position: 'relative' }}>
            {/* Container Wave Overlays */}
            {pulseEffect && !swiped && (
                <Animated.View style={[
                    StyleSheet.absoluteFillObject,
                    { 
                        backgroundColor: sliderColor, 
                        borderRadius: 100, 
                        transform: [{ scaleX: waveScaleX }, { scaleY: waveScaleY }], 
                        opacity: waveOpacity 
                    }
                ]} pointerEvents="none" />
            )}

            <View style={[styles.container, { backgroundColor: containerColor, borderWidth: 1, borderColor: sliderColor }]}>
                <Text style={[styles.text, { color: textColor }]}>{text}</Text>
                
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.thumb,
                        { backgroundColor: sliderColor },
                        isLeft ? { right: THUMB_PADDING } : { left: THUMB_PADDING },
                        animatedStyles
                    ]}
                >
                    <Feather name={thumbIcon} size={28} color="#0b1326" />
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: BUTTON_WIDTH,
        height: THUMB_SIZE + (THUMB_PADDING * 2),
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
    }
});
