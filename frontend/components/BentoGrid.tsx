import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface SkierStat {
  id: string;
  type?: string;
  label: string;
  value: string | number;
  unit: string;
  rank: number;
  iconName: keyof typeof Feather.glyphMap;
}

interface BentoGridProps {
  stats: SkierStat[];
}

const RankBadge = ({ rank }: { rank: number }) => {
  // Highlight top ranks
  let bgClass = "bg-[#22d3ee]/20"; // primary-container
  let textClass = "text-[#8aebff]"; // primary
  if (rank === 1) {
    bgClass = "bg-[#ffd700]/20"; textClass = "text-[#ffd700]";
  } else if (rank === 2) {
    bgClass = "bg-[#c0c0c0]/20"; textClass = "text-[#c0c0c0]";
  } else if (rank === 3) {
    bgClass = "bg-[#cd7f32]/20"; textClass = "text-[#cd7f32]";
  }

  return (
    <View className={`${bgClass} px-3 py-1 rounded-full self-start mb-4`}>
      <Text className={`${textClass} font-bold text-xs uppercase tracking-widest`}>
        #{rank}
      </Text>
    </View>
  );
};

const StatCard = ({ item, isHero }: { item: SkierStat; isHero?: boolean }) => {
  return (
    <View className={`bg-surface-container-high rounded-2xl overflow-hidden p-4 flex-1 relative ${isHero ? 'bg-surface-container-low p-6' : ''}`}>
      <RankBadge rank={item.rank} />

      {/* Absolute positioned Icon in background */}
      <View className="absolute top-4 right-4 opacity-30">
        <Feather name={item.iconName} size={isHero ? 130 : 54} color="#8aebff" style={{ opacity: 0.5 }} />
      </View>

      <View className="flex-1 justify-end">
        <Text className="text-gray-400 text-xs uppercase tracking-widest mb-1" numberOfLines={1} adjustsFontSizeToFit >{item.label}</Text>
        <View className="flex-row items-baseline gap-1">
          <Text className={`${isHero ? 'text-6xl tracking-tighter' : 'text-3xl tracking-tight'} font-bold text-white`} numberOfLines={1} adjustsFontSizeToFit>
            {item.value}
          </Text>
          <Text className="text-gray-400 text-sm ml-1">{item.unit}</Text>
        </View>
      </View>
    </View>
  );
};

export const BentoGrid = ({ stats }: BentoGridProps) => {
  if (!stats || stats.length === 0) return null;

  // Sort stats by rank
  const sortedStats = [...stats].sort((a, b) => a.rank - b.rank);

  const hero = sortedStats[0];
  const side1 = sortedStats[1];
  const side2 = sortedStats[2];
  const bottomRow = sortedStats.slice(3); // The rest

  return (
    <View className="flex flex-col gap-4">
      {/* Top Section */}
      <View className="flex flex-row gap-4 h-80">
        {/* Hero Card */}
        {hero && (
          <View className="flex-[1.4] h-full">
            <StatCard item={hero} isHero={true} />
          </View>
        )}

        {/* Side Stack */}
        {(side1 || side2) && (
          <View className="flex-1 flex flex-col gap-4 h-full">
            {side1 && <StatCard item={side1} />}
            {side2 && <StatCard item={side2} />}
          </View>
        )}
      </View>

      {/* Bottom Section */}
      {bottomRow.length > 0 && (
        <View className="flex flex-row flex-wrap gap-4">
          {bottomRow.map((stat) => (
            <View key={stat.id} className="flex-1 min-w-[45%] h-40">
              <StatCard item={stat} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
