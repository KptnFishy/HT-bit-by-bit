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
    direction = 'right'
}: SwipeButtonProps) => {
    const pan = useRef(new Animated.Value(0)).current;
    const [swiped, setSwiped] = useState(false);

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

    const thumbIcon = isLeft ? 'chevron-left' : 'chevron-right';

    return (
        <View style={[styles.container, { backgroundColor: containerColor }]}>
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
