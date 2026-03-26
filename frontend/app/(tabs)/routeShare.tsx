import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RouteCard, RouteData } from '../../components/RouteCard';

export default function RouteShare() {
    const [activeFilter, setActiveFilter] = useState('ALLE ENTDECKEN');

    const filters = ['ALLE ENTDECKEN', 'BELIEBT', 'NAHEGELEGEN'];

    const mockRoutes: RouteData[] = [
        {
            id: '1',
            title: 'Gletscher-Express 3000',
            distance: '12.4',
            location: 'Zermatt, Schweiz',
            difficulty: 'SCHWER',
            rating: 4.5,
            uploaderName: 'Marco V.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: '2',
            title: 'Sonnenuntergangs-Lauf',
            distance: '5.8',
            location: 'Ischgl, Österreich',
            difficulty: 'MITTEL',
            rating: 4,
            uploaderName: 'Sarah K.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: '3',
            title: 'Anfänger Runde Talschluss',
            distance: '3.2',
            location: 'Saalbach, Österreich',
            difficulty: 'LEICHT',
            rating: 5,
            uploaderName: 'Lukas B.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1541256942802-7a09c25f778a?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://images.unsplash.com/photo-1524316045187-b9c1cb807a51?auto=format&fit=crop&w=800&q=80'
        }
    ];

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-[#0b1326]">
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 150 }}
                stickyHeaderIndices={[0]}
            >
                {/* Sticky Header Section */}
                <View className="bg-[#0b1326] pb-4 pt-2">
                    <Text className="text-[#8aebff] text-[10px] font-bold tracking-widest uppercase mb-1">
                        Community Hub
                    </Text>
                    <Text className="text-white text-4xl font-black tracking-tight mb-6">
                        Geteilte Routen
                    </Text>

                    {/* Filter Pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
                        {filters.map((filter) => {
                            const isActive = activeFilter === filter;
                            return (
                                <TouchableOpacity 
                                    key={filter}
                                    onPress={() => setActiveFilter(filter)}
                                    className={`px-5 py-2.5 rounded-full mr-3 ${isActive ? 'bg-[#8aebff]' : 'bg-[#131b2e]'}`}
                                >
                                    <Text className={`text-[10px] font-bold tracking-widest uppercase ${isActive ? 'text-[#0b1326]' : 'text-gray-400'}`}>
                                        {filter}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Route Cards */}
                <View className="pt-2">
                    {mockRoutes.map(route => (
                        <RouteCard 
                            key={route.id} 
                            route={route} 
                            onPressRide={() => console.log('Ride route:', route.id)}
                        />
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}