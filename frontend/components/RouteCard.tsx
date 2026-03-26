import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type Difficulty = 'LEICHT' | 'MITTEL' | 'SCHWER';

export interface RouteData {
    id: string;
    title: string;
    distance: string;
    location: string;
    difficulty: Difficulty;
    rating: number;
    uploaderName: string;
    uploaderAvatar: string;
    mapImageUrl: string;
}

interface RouteCardProps {
    route: RouteData;
    onPressRow?: () => void;
    onPressRide?: () => void;
}

export const RouteCard = ({ route, onPressRow, onPressRide }: RouteCardProps) => {
    // Render stars
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= route.rating) {
                stars.push(<FontAwesome key={i} name="star" size={10} color="#fbbf24" />); // amber-400
            } else if (i - 0.5 === route.rating) {
                stars.push(<FontAwesome key={i} name="star-half-o" size={10} color="#fbbf24" />);
            } else {
                stars.push(<FontAwesome key={i} name="star-o" size={10} color="#4b5563" />); // gray-600
            }
        }
        return <View className="flex-row gap-[3px]">{stars}</View>;
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={onPressRow}
            className="w-full bg-[#131b2e] rounded-3xl overflow-hidden mb-8"
            style={{ height: 420 }}
        >
            <Image 
                source={{ uri: route.mapImageUrl }} 
                className="absolute inset-0 w-full h-full opacity-90" 
                resizeMode="cover"
            />
            
            <LinearGradient
                colors={['transparent', 'rgba(11, 19, 38, 0.5)', '#0b1326']}
                locations={[0.2, 0.65, 1]}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {/* Difficulty Badge */}
            <View className="absolute top-5 left-5 bg-black/50 px-3 py-1.5 rounded-full">
                <Text className="text-white text-[9px] font-bold tracking-[2px] uppercase">
                    {route.difficulty}
                </Text>
            </View>

            {/* Bottom Content Area */}
            <View className="flex-1 justify-end p-5 pb-6">
                
                {/* Title and Distance Row */}
                <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-white text-3xl font-bold tracking-tight flex-1" numberOfLines={2}>
                        {route.title}
                    </Text>
                    <View className="items-end justify-end ml-4 mb-2">
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-[#8aebff] text-2xl font-black">{route.distance}</Text>
                            <Text className="text-[#8aebff] text-[10px] font-bold uppercase tracking-wider">KM</Text>
                        </View>
                    </View>
                </View>

                {/* Location and Rating Row */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center gap-1.5">
                        <Feather name="map-pin" size={12} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs font-medium">{route.location}</Text>
                    </View>
                    <View>
                        {renderStars()}
                    </View>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-white/10 mb-5" />

                {/* Footer / CTA Row */}
                <View className="flex-row justify-between items-center">
                    {/* Uploader */}
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-[#131b2e] border border-[#22d3ee] p-[2px]">
                            <Image 
                                source={{ uri: route.uploaderAvatar }} 
                                className="w-full h-full rounded-full"
                            />
                        </View>
                        <View>
                            <Text className="text-gray-500 text-[8px] uppercase tracking-widest font-bold mb-0.5">
                                Hochgeladen von
                            </Text>
                            <Text className="text-white text-sm font-bold tracking-wide">
                                {route.uploaderName}
                            </Text>
                        </View>
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={onPressRide}
                        className="bg-[#22d3ee] px-4 py-3 rounded-2xl items-center justify-center"
                    >
                        <Text className="text-[#0b1326] text-[10px] text-center font-bold uppercase tracking-widest">
                            Fahre Diese{'\n'}Route
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </TouchableOpacity>
    );
};
