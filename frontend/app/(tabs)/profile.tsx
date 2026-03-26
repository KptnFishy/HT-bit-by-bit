import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoGrid, SkierStat } from '../../components/BentoGrid';
import { Feather } from '@expo/vector-icons';

export default function Profile() {
    const dummyData: SkierStat[] = [
        {
            id: '1',
            type: 'max_speed',
            label: 'Höchstgeschwindigkeit',
            value: 160,
            unit: 'km/h',
            rank: 3,
            iconName: 'zap'
        },
        {
            id: '2',
            type: 'total_distance',
            label: 'Gesamtdistanz',
            value: '1920',
            unit: 'km',
            rank: 80,
            iconName: 'map'
        },
        {
            id: '3',
            type: 'max_descent',
            label: 'Höchste Abfahrt',
            value: '1463',
            unit: 'm',
            rank: 162,
            iconName: 'trending-down'
        },
        {
            id: '4',
            type: 'time',
            label: 'Abfahrtszeit',
            value: 240,
            unit: 'h',
            rank: 245,
            iconName: 'clock'
        },
        {
            id: '5',
            type: 'longest_descent',
            label: 'Längste Abfahrt',
            value: 1350,
            unit: 'm',
            rank: 344,
            iconName: 'git-commit'
        },
        {
            id: '6',
            type: 'average_speed',
            label: 'Durchschnittsgeschwindigkeit',
            value: 65,
            unit: 'km/h',
            rank: 412,
            iconName: 'bar-chart-2'
        }
    ];

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-surface pb-20">
            <ScrollView className="flex-1 py-4 px-4">
                {/* User Profile Header */}
                <View className="items-center mb-10 mt-6">
                    <View className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary mb-4" style={{ shadowColor: '#8aebff', shadowOpacity: 0.3, shadowRadius: 20 }}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=300&auto=format&fit=crop' }}
                            className="w-full h-full"
                        />
                    </View>
                    <Text className="text-white text-3xl font-bold tracking-tight mb-1">Lukas Bergsteiger</Text>
                    <View className="flex-row items-center gap-1">
                        <Feather name="map-pin" size={14} color="#9ca3af" />
                        <Text className="text-gray-400 text-sm tracking-wide">Innsbruck, Tirol</Text>
                    </View>
                </View>

                <Text className="text-white text-3xl font-bold mb-6 tracking-tight">Deine Statistiken</Text>
                <BentoGrid stats={dummyData} />
                <View className="h-12" />
            </ScrollView>
        </SafeAreaView>
    );
}