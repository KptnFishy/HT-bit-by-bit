import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, useEffect, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    // 1. ANIMATION SETUP
    const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

    const buttonWidth = dimensions.width / state.routes.length;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * buttonWidth,
            useNativeDriver: true,
            damping: 22, //box bounciness
            stiffness: 200,
        }).start();
    }, [state.index, buttonWidth]);

    // get width of container
    const onLayout = (e: LayoutChangeEvent) => {
        setDimensions({
            height: e.nativeEvent.layout.height,
            width: e.nativeEvent.layout.width,
        });
    };

    const icons: Record<string, keyof typeof Feather.glyphMap> = {
        index: 'home',
        leaderboard: 'bar-chart-2',
        routeShare: 'map',
        profile: 'user',
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            <LinearGradient
                colors={['transparent', 'rgba(11, 19, 38, 0.7)', '#0b1326']}
                style={styles.gradient}
                pointerEvents="none"
            />
            <View style={styles.tabBar} onLayout={onLayout}>

                <Animated.View
                    style={[
                        styles.activeTabBackground,
                        {
                            width: buttonWidth - 10,
                            transform: [{ translateX }],
                        },
                    ]}
                />

                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? options.title ?? route.name;
                    const isFocused = state.index === index;
                    const iconName = icons[route.name] || 'circle';

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    const iconColor = isFocused ? '#8aebff' : '#9ca3af';
                    const textColor = isFocused ? '#8aebff' : '#9ca3af';

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarButtonTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            <View style={{ marginBottom: 4, alignItems: 'center' }}>
                                <Feather name={iconName} size={20} color={iconColor} />
                                {options.tabBarBadge && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{options.tabBarBadge}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={{
                                color: textColor,
                                fontSize: 10,
                                fontWeight: isFocused ? '600' : '400'
                            }}>
                                {label.toString()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100, // Fade out the bottom 140px
        justifyContent: 'flex-end',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 140,
    },
    tabBar: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        borderRadius: 20,
        height: 70,
        maxWidth: 360,
        backgroundColor: '#131b2e', // Alpine surface-container-low
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        alignSelf: 'center', // Fix for wider screens so it stays centered
    },
    activeTabBackground: {
        position: 'absolute',
        height: 55,
        left: 8,
        top: 7.5,
        bottom: 7.5,
        maxWidth: 72,
        borderRadius: 15,
        backgroundColor: '#22d3ee', // primary-container
        opacity: 0.15, // Subtle background selection glow
        zIndex: 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 1,
    },
    badge: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: '#ff4444',
        borderRadius: 6,
        minWidth: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    }
});
