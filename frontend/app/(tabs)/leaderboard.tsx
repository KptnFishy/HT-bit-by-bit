import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ViewabilityConfig, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MetricKey = 'maxSpeed' | 'totalDistance' | 'maxDescent' | 'timeSpent';

interface Metric {
    key: MetricKey;
    label: string;
    unit: string;
}

const metrics: Metric[] = [
    { key: 'maxSpeed', label: 'HÖCHSTGESCHWINDIGKEIT', unit: 'km/h' },
    { key: 'totalDistance', label: 'GESAMTDISTANZ', unit: 'km' },
    { key: 'maxDescent', label: 'HÖCHSTE ABFAHRT', unit: 'm' },
    { key: 'timeSpent', label: 'ABFAHRTSZEIT', unit: 'h' },
];

interface UserStats {
    id: string;
    name: string;
    avatarUrl: string;
    stats: Record<MetricKey, number>;
}

// 1. Expanded Mock Data Source
const CURRENT_USER_ID = 'me';

const generateMockExpanded = (): UserStats[] => {
    const baseUsers = [
        { id: '1', name: 'Marco V.', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 142, totalDistance: 3200, maxDescent: 2100, timeSpent: 420 } },
        { id: '2', name: 'Sarah K.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 128, totalDistance: 4500, maxDescent: 1800, timeSpent: 510 } },
        { id: '3', name: 'Jan P.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 170, totalDistance: 2100, maxDescent: 3100, timeSpent: 280 } },
        { id: '4', name: 'Elena M.', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 110, totalDistance: 1800, maxDescent: 1500, timeSpent: 300 } },
        { id: '5', name: 'Felix R.', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 135, totalDistance: 5200, maxDescent: 2500, timeSpent: 600 } },
        { id: '6', name: 'Anna W.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 105, totalDistance: 1200, maxDescent: 1100, timeSpent: 150 } },
        { id: '7', name: 'Tom H.', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 122, totalDistance: 2800, maxDescent: 1950, timeSpent: 340 } },
        { id: '8', name: 'Lisa F.', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 130, totalDistance: 3100, maxDescent: 1750, timeSpent: 380 } },
        { id: '9', name: 'David B.', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 165, totalDistance: 1900, maxDescent: 2800, timeSpent: 250 } },
        { id: '10', name: 'Sophie L.', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 115, totalDistance: 2200, maxDescent: 1600, timeSpent: 290 } },
        { id: '11', name: 'Max C.', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 120, totalDistance: 2400, maxDescent: 1700, timeSpent: 310 } },
        { id: '12', name: 'Julia N.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 125, totalDistance: 2600, maxDescent: 1850, timeSpent: 330 } },
        { id: CURRENT_USER_ID, name: 'Lukas Bergsteiger', avatarUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=150&auto=format&fit=crop', stats: { maxSpeed: 160, totalDistance: 1920, maxDescent: 1463, timeSpent: 240 } },
    ];

    // Add additional 15 random dummy athletes to extend list deeply
    for (let i = 13; i <= 30; i++) {
        baseUsers.push({
            id: String(i),
            name: `Athlete ${i}`,
            avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?q=80&w=150&auto=format&fit=crop`,
            stats: {
                maxSpeed: Math.floor(Math.random() * 60) + 80,
                totalDistance: Math.floor(Math.random() * 4000) + 500,
                maxDescent: Math.floor(Math.random() * 2000) + 500,
                timeSpent: Math.floor(Math.random() * 400) + 50
            }
        });
    }
    return baseUsers;
};

const mockUsers = generateMockExpanded();

const RankBadge = ({ rank }: { rank: number }) => {
    let bgClass = "bg-[#131b2e]";
    let textClass = "text-[#9ca3af]";
    let dynamicStyle: any = {};

    if (rank === 1) {
        bgClass = "bg-[#ffd700]"; textClass = "text-[#0b1326]";
    } else if (rank === 2) {
        bgClass = "bg-[#c0c0c0]"; textClass = "text-[#0b1326]";
    } else if (rank === 3) {
        bgClass = "bg-[#cd7f32]"; textClass = "text-[#0b1326]";
    } else if (rank <= 10) {
        bgClass = ""; textClass = "text-[#8aebff]";
        dynamicStyle = { backgroundColor: 'rgba(34, 211, 238, 0.2)' }; // #22d3ee/20
    }

    return (
        <View className={`${bgClass} w-8 h-8 rounded-full items-center justify-center`} style={dynamicStyle}>
            <Text className={`${textClass} text-xs font-black tracking-tighter`}>
                {rank}
            </Text>
        </View>
    );
};

const LeaderboardRow = ({ user, rank, activeMetricDef, isCurrentUser = false }: { user: UserStats, rank: number, activeMetricDef: Metric, isCurrentUser?: boolean }) => {
    // Elevate Top 3 Visibility
    let containerClass = "flex-row items-center px-4 py-3 mb-2 rounded-[16px] bg-[#131b2e]";
    let nameClass = "text-white text-sm font-bold tracking-tight";
    let scoreClass = "text-white text-xl font-black tracking-tighter";
    let avatarClass = "w-10 h-10 rounded-full mr-4 bg-black overflow-hidden";
    let containerStyle: any = {};

    if (rank === 1) {
        containerClass = "flex-row items-center px-5 py-5 mb-3 rounded-[24px] border";
        nameClass = "text-white text-lg font-black tracking-tight";
        scoreClass = "text-[#ffd700] text-3xl font-black tracking-tighter";
        avatarClass = "w-14 h-14 rounded-full mr-4 bg-black overflow-hidden border-2 border-[#ffd700]";
        containerStyle = { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.5)' };
    } else if (rank === 2) {
        containerClass = "flex-row items-center px-4 py-4 mb-2 rounded-[20px] border";
        nameClass = "text-white text-base font-bold tracking-tight";
        scoreClass = "text-[#c0c0c0] text-2xl font-black tracking-tighter";
        avatarClass = "w-12 h-12 rounded-full mr-4 bg-black overflow-hidden border border-[#c0c0c0]";
        containerStyle = { backgroundColor: 'rgba(192, 192, 192, 0.1)', borderColor: 'rgba(192, 192, 192, 0.3)' };
    } else if (rank === 3) {
        containerClass = "flex-row items-center px-4 py-4 mb-2 rounded-[20px] border";
        nameClass = "text-white text-base font-bold tracking-tight";
        scoreClass = "text-[#cd7f32] text-2xl font-black tracking-tighter";
        avatarClass = "w-12 h-12 rounded-full mr-4 bg-black overflow-hidden border border-[#cd7f32]";
        containerStyle = { backgroundColor: 'rgba(205, 127, 50, 0.1)', borderColor: 'rgba(205, 127, 50, 0.3)' };
    }

    if (isCurrentUser) {
        containerClass = `flex-row items-center px-4 py-3 mb-2 rounded-[16px] bg-[#222a3d] border border-[#22d3ee] shadow-lg`;
        containerStyle = { shadowColor: '#22d3ee', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } };
        if (rank <= 3) {
            containerClass = `flex-row items-center ${rank === 1 ? 'px-5 py-5 mb-3 rounded-[24px]' : 'px-4 py-4 mb-2 rounded-[20px]'} bg-[#222a3d] border-2 border-[#22d3ee] shadow-lg`;
        }
    }

    return (
        <View className={containerClass} style={containerStyle}>
            <View className="w-10 items-center justify-center mr-2">
                <RankBadge rank={rank} />
            </View>

            <View className={avatarClass}>
                <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
            </View>

            <View className="flex-1 justify-center">
                <Text className={nameClass}>{user.name}</Text>
                {isCurrentUser && <Text className="text-[#8aebff] text-[9px] uppercase tracking-widest font-bold mt-0.5">Du</Text>}
            </View>

            <View className="items-end">
                <Text className={`${isCurrentUser && rank > 3 ? 'text-[#8aebff]' : scoreClass}`}>
                    {user.stats[activeMetricDef.key]}
                </Text>
                <Text className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">{activeMetricDef.unit}</Text>
            </View>
        </View>
    );
};

export default function Leaderboard() {
    const [activeMetric, setActiveMetric] = useState<MetricKey>('maxSpeed');
    const [isUserOnScreen, setIsUserOnScreen] = useState(false);

    // 2. Sorting Logic
    const activeMetricDef = metrics.find(m => m.key === activeMetric)!;

    const sortedUsers = useMemo(() => {
        return [...mockUsers].sort((a, b) => b.stats[activeMetric] - a.stats[activeMetric]);
    }, [activeMetric]);

    // Fast mapping to keep ID referencing easy for FlatList tracking
    const enrichedUsers = useMemo(() => {
        return sortedUsers.map((user, index) => ({
            ...user,
            rank: index + 1
        }));
    }, [sortedUsers]);

    const currentUserData = enrichedUsers.find(u => u.id === CURRENT_USER_ID);

    // Viewport Intersection tracking
    const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const isVisible = viewableItems.some(v => v.item.id === CURRENT_USER_ID);
        
        // Wrap state update in requestAnimationFrame to prevent React synchronous 
        // unmount/re-render crashes (like Navigation Context errors) when FlatList data aggressively re-sorts.
        requestAnimationFrame(() => {
            setIsUserOnScreen(isVisible);
        });
    }, []);

    const viewabilityConfig = React.useRef({
        itemVisiblePercentThreshold: 10,
        minimumViewTime: 100
    }).current;

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-[#0b1326]">

            {/* Main Non-Scrolling Sticky Header */}
            <View className="bg-[#0b1326] px-5 pb-4 pt-2">
                <Text className="text-[#8aebff] text-[10px] font-bold tracking-widest uppercase mb-1">
                    Community Hub
                </Text>
                <Text className="text-white text-4xl font-black tracking-tight mb-6">
                    Bestenliste
                </Text>

                {/* Metric Selector Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                    {metrics.map((metric) => {
                        const isActive = activeMetric === metric.key;
                        return (
                            <TouchableOpacity
                                key={metric.key}
                                onPress={() => setActiveMetric(metric.key)}
                                className={`px-5 py-2.5 rounded-full mr-3 ${isActive ? 'bg-[#8aebff]' : 'bg-[#131b2e]'}`}
                            >
                                <Text className={`text-[10px] font-bold tracking-widest uppercase ${isActive ? 'text-[#0b1326]' : 'text-gray-400'}`}>
                                    {metric.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* FlatList automatically handles giant scrolling datasets and checks visibility via ViewTokens */}
            <FlatList
                data={enrichedUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                    <LeaderboardRow
                        user={item}
                        rank={item.rank}
                        activeMetricDef={activeMetricDef}
                        isCurrentUser={item.id === CURRENT_USER_ID}
                    />
                )}
            />

            {/* Sticky User Footer (Only visible when user is scrolled out of view) */}
            {!isUserOnScreen && currentUserData && (
                <View
                    style={{ position: 'absolute', bottom: 100, left: 20, right: 20 }}
                >
                    <View className="bg-[#222a3d] shadow-lg rounded-[16px] shadow-black" style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 15 }}>
                        <LeaderboardRow
                            user={currentUserData}
                            rank={currentUserData.rank}
                            activeMetricDef={activeMetricDef}
                            isCurrentUser={true}
                        />
                    </View>
                </View>
            )}

        </SafeAreaView>
    );
}