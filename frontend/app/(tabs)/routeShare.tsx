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
            mapImageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80' // Snowy mountain peak
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
            mapImageUrl: 'https://loremflickr.com/800/600/snow,mountain?lock=2' 
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
            mapImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' 
        },
        {
            id: '4',
            title: 'Weiße Hölle',
            distance: '18.5',
            location: 'St. Anton, Österreich',
            difficulty: 'SCHWER',
            rating: 4.5,
            uploaderName: 'Elena M.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://loremflickr.com/800/600/snow,mountain?lock=4' 
        },
        {
            id: '5',
            title: 'Panorama-Route',
            distance: '8.1',
            location: 'Chamonix, Frankreich',
            difficulty: 'MITTEL',
            rating: 5,
            uploaderName: 'Jan P.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://loremflickr.com/800/600/snow,mountain?lock=5' 
        },
        {
            id: '6',
            title: 'Tiefschnee-Traum',
            distance: '4.5',
            location: 'Lech, Österreich',
            difficulty: 'SCHWER',
            rating: 4,
            uploaderName: 'Anna W.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://loremflickr.com/800/600/snow,mountain?lock=6' 
        },
        {
            id: '7',
            title: 'Familienabfahrt Nord',
            distance: '6.0',
            location: 'Kitzbühel, Österreich',
            difficulty: 'LEICHT',
            rating: 3.5,
            uploaderName: 'Tom H.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80' 
        },
        {
            id: '8',
            title: 'Schneebruch-Trail',
            distance: '15.2',
            location: 'Verbier, Schweiz',
            difficulty: 'SCHWER',
            rating: 4.5,
            uploaderName: 'David B.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80' 
        },
        {
            id: '9',
            title: 'Waldlauf Süd',
            distance: '7.8',
            location: 'Sölden, Österreich',
            difficulty: 'MITTEL',
            rating: 4,
            uploaderName: 'Lisa F.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://loremflickr.com/800/600/snow,mountain?lock=9' 
        },
        {
            id: '10',
            title: 'Morgenrot-Skiing',
            distance: '9.3',
            location: 'Seefeld, Österreich',
            difficulty: 'LEICHT',
            rating: 5,
            uploaderName: 'Max C.',
            uploaderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            mapImageUrl: 'https://loremflickr.com/800/600/snow,mountain?lock=10' 
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