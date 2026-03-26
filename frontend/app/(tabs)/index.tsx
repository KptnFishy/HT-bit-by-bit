import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SwipeButton } from '../../components/SwipeButton';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type RideState = 'IDLE' | 'RIDING' | 'CRASHED' | 'RESCUE';

interface GroupMember {
  id: string;
  name: string;
  color: string;
  routeCoordinates: number[][];
  isVisible: boolean;
  hasCrashed?: boolean;
}

const baseCoords = [
  [10.121895, 47.218870],
  [10.122857, 47.218924],
  [10.123323, 47.218762],
  [10.123908, 47.218668],
  [10.124632, 47.218743],
  [10.125313, 47.218736],
  [10.125919, 47.218723],
  [10.126462, 47.218742],
  [10.127014, 47.218802],
  [10.127459, 47.218911],
  [10.127988, 47.218922],
  [10.128494, 47.218931],
  [10.129506, 47.218895],
  [10.130357, 47.218921],
  [10.130812, 47.218962],
  [10.131599, 47.219210],
  [10.131953, 47.219273]
];

export default function Index() {
  const API_KEY = 'bf6kRWUoAyyCl2UMxaBC';
  const webviewRef = useRef<WebView>(null);

  const [rideState, setRideState] = useState<RideState>('IDLE');
  const [crashTimer, setCrashTimer] = useState(10);
  const [isGroupExpanded, setIsGroupExpanded] = useState(true);

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    {
      id: 'm1',
      name: 'Sarah K.',
      color: '#4ade80', // Green
      isVisible: true,
      routeCoordinates: baseCoords.map((c, i) => [
        c[0] + Math.sin(i * 0.8) * 0.00003, 
        c[1] + Math.cos(i * 0.8) * 0.00003
      ]) // Weaving sine wave pattern tightly around the main line
    },
    {
      id: 'm2',
      name: 'Marco V.',
      color: '#fb923c', // Orange
      isVisible: true,
      routeCoordinates: baseCoords.map((c, i) => [
        c[0] + Math.cos(i * 1.1) * 0.00004, 
        c[1] + Math.sin(i * 1.1) * 0.00004
      ]) // Slightly different frequency to weave randomly over Sarah and Ich
    },
    {
      id: 'm3',
      name: 'Felix M.',
      color: '#3b82f6', // Blue
      isVisible: true,
      hasCrashed: true,
      routeCoordinates: [
          ...baseCoords.slice(0, 8).map((c, i) => [
            c[0] + Math.sin(i * 0.6) * 0.00002, 
            c[1] - Math.cos(i * 0.6) * 0.00003
          ]), // Follows weave loosely until point 8
          [10.126462 + 0.00005, 47.218742 - 0.00015], // Drifts off-piste sharply south
          [10.126462 + 0.00010, 47.218742 - 0.00035], // Straying further
          [10.126462 + 0.00015, 47.218742 - 0.00060], // Crashes here
      ]
    },
    {
      id: 'me',
      name: 'Lukas B (Ich)',
      color: '#dc2626', // Red
      isVisible: true,
      routeCoordinates: baseCoords
    }
  ]);

  // Keep static ref to prevent WebView full reload on HTML re-evaluation
  const initialGroupMembers = useRef(groupMembers).current;

  // Sync state changes explicitly via Javascript Injection instead of HTML rebuild
  useEffect(() => {
    if (rideState === 'RIDING' && webviewRef.current) {
      webviewRef.current.injectJavaScript(`
            if (typeof updateRoutes === 'function') {
                updateRoutes('${JSON.stringify(groupMembers)}');
            }
            true;
        `);
    }
  }, [groupMembers, rideState]);

  // Crash Timer Hook
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (rideState === 'CRASHED' && crashTimer > 0) {
      interval = setInterval(() => {
        setCrashTimer(prev => prev - 1);
      }, 1000);
    } else if (rideState === 'CRASHED' && crashTimer === 0) {
      setRideState('RESCUE');
    }
    return () => clearInterval(interval);
  }, [rideState, crashTimer]);

  const toggleMemberVisibility = (id: string) => {
    setGroupMembers(prev => prev.map(m => m.id === id ? { ...m, isVisible: !m.isVisible } : m));
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <title>3D Terrain Map</title>
        <script src="https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.umd.min.js"></script>
        <link href="https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.css" rel="stylesheet" />
        <style>
          body { margin: 0; padding: 0; background-color: #000; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
          .maplibregl-ctrl-inspect { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let currentMap = null;

          function updateRoutes(membersStr) {
            if (!currentMap || !currentMap.isStyleLoaded()) return;
            const members = JSON.parse(membersStr);
            
            members.forEach(member => {
              const sourceId = 'route-' + member.id;
              const layerId = 'layer-' + member.id;
              
              if (!currentMap.getSource(sourceId)) {
                currentMap.addSource(sourceId, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: member.routeCoordinates },
                    properties: {}
                  }
                });
                currentMap.addLayer({
                  id: layerId,
                  type: 'line',
                  source: sourceId,
                  layout: { 'line-join': 'round', 'line-cap': 'round' },
                  paint: {
                    'line-color': member.color,
                    'line-width': 6,
                    'line-opacity': 0.8
                  }
                });
              }

              // Update visibility dynamically
              if (currentMap.getLayer(layerId)) {
                currentMap.setLayoutProperty(
                  layerId,
                  'visibility',
                  member.isVisible ? 'visible' : 'none'
                );
              }
            });
          }

          try {
            maptilersdk.config.apiKey = '${API_KEY}';
            
            const map = new maptilersdk.Map({
              container: 'map',
              style: maptilersdk.MapStyle.OUTDOOR,
              center: [10.126500, 47.218800], // Centered exactly at the piste point
              zoom: 15.5,                     // Zoomed closer to see the parallel offset perfectly
              terrain: true,
              terrainControl: true,
              pitch: 70,
              maxPitch: 85,
              antialias: true
            });

            currentMap = map;

            map.on('load', () => {
                updateRoutes('${JSON.stringify(initialGroupMembers)}');
            });
          } catch (e) {
            alert("Map Error: " + e.message);
          }
        </script>
      </body>
    </html>
  `;

  if (rideState === 'IDLE') {
    return (
      <SafeAreaView className="flex-1 bg-[#0b1326] items-center justify-between py-10">
        <Tabs.Screen options={{ tabBarStyle: { display: 'flex' } }} />
        <View className="items-center mt-[30%]">
          <Feather name="map-pin" size={48} color="#8aebff" className="mb-4" />
          <Text className="text-[#8aebff] text-5xl font-black tracking-widest mt-4">ABFAHRT</Text>
          <Text className="text-gray-400 text-xs font-bold tracking-[4px] uppercase mt-6 text-center leading-5">
            Bereit für dein{'\n'}nächstes Abenteuer
          </Text>
        </View>

        <View className="mb-[25%]">
          <SwipeButton
            key="start"
            text="Fahrt Starten"
            direction="right"
            sliderColor="#8aebff"
            containerColor="#131b2e"
            textColor="#9ca3af"
            onSwipeSuccess={() => setRideState('RIDING')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (rideState === 'CRASHED') {
    return (
      <SafeAreaView className="flex-1 bg-red-600 items-center justify-between py-10">
        <Tabs.Screen options={{ tabBarStyle: { display: 'none' } }} />
        <View className="items-center mt-20">
          <Feather name="alert-triangle" size={64} color="white" />
          <Text className="text-white text-5xl font-black tracking-tighter mt-6 text-center">
            STURZ{'\n'}ERKANNT
          </Text>
          <Text className="text-white text-xl font-bold tracking-widest uppercase mt-8 text-center px-4">
            Bergrettung wird kontaktiert in
          </Text>
          <Text className="text-white text-9xl font-black mt-4">{crashTimer}</Text>
        </View>

        <View className="mb-[25%] w-full items-center">
          <SwipeButton
            key="cancel"
            text="SOS Abbrechen"
            direction="right"
            sliderColor="#ffffff"
            containerColor="rgba(0,0,0,0.3)"
            textColor="#ffffff"
            onSwipeSuccess={() => setRideState('RIDING')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (rideState === 'RESCUE') {
    return (
      <SafeAreaView className="flex-1 bg-[#131b2e] items-center justify-center p-6">
        <Tabs.Screen options={{ tabBarStyle: { display: 'none' } }} />
        <Feather name="shield" size={80} color="#22d3ee" className="mb-8" />
        <Text className="text-[#22d3ee] text-3xl font-black tracking-tighter text-center mb-4">
          HILFE IST UNTERWEGS
        </Text>
        <Text className="text-gray-300 text-center text-base mb-12 flex-row leading-7 font-medium px-4">
          Ihre Notfallkontakte und die alpine Bergrettung wurden über Ihren Standort informiert.{'\n\n'}
          <Text className="text-xs uppercase tracking-widest text-[#9ca3af]">(Simulation)</Text>
        </Text>

        <TouchableOpacity
          onPress={() => setRideState('IDLE')}
          className="bg-[#222a3d] px-8 py-5 rounded-full border-2 border-[#8aebff]"
        >
          <Text className="text-white font-black tracking-widest text-sm uppercase">Simulation Beenden</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' } }} />

      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml, baseUrl: 'https://www.maptiler.com' }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
      />

      {/* Fade at bottom behind the Stop Button */}
      <LinearGradient
        colors={['transparent', 'rgba(11, 19, 38, 0.7)', '#0b1326']}
        className="absolute bottom-0 left-0 right-0 h-48"
        pointerEvents="none"
      />

      {/* Map Overlays Area */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill} className="pt-12 px-4 flex-1">

        {/* Top Row: Crash Button (Left) & Group Panel (Right) */}
        <View pointerEvents="box-none" className="flex-row justify-between items-start">

          {/* Left: Crash Simulieren */}
          <TouchableOpacity
            onPress={() => {
              setCrashTimer(10);
              setRideState('CRASHED');
            }}
            className="bg-red-500/90 rounded-full px-4 py-3 flex-row items-center border border-red-400 gap-2 shadow-lg"
          >
            <Feather name="alert-triangle" size={14} color="white" />
            <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">Crash</Text>
          </TouchableOpacity>

          {/* Right: Group Panel */}
          <View className="bg-[#131b2e]/90 rounded-[24px] p-3 w-56 shadow-lg border border-gray-800" style={{ shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10 }}>
            {/* Header */}
            <View className={`flex-row items-center justify-between pl-1 ${isGroupExpanded ? 'mb-4' : ''}`}>
              <View className="flex-row items-center">
                <View className="w-1.5 h-6 bg-[#6b7280] rounded-full mr-3" />
                <Text className="text-white text-lg font-bold">Gruppe</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsGroupExpanded(!isGroupExpanded)}
                className="bg-[#22d3ee]/20 w-7 h-7 rounded-full items-center justify-center"
              >
                <Feather name={isGroupExpanded ? "minus" : "plus"} size={16} color="#8aebff" />
              </TouchableOpacity>
            </View>

            {/* List */}
            {isGroupExpanded && (
              <View>
                {groupMembers.map(member => (
                  <View 
                    key={member.id} 
                    className={`flex-row items-center justify-between rounded-full p-1 mb-2 pl-2 border ${
                        member.hasCrashed 
                            ? 'bg-red-500/20 border-red-500/50' 
                            : 'bg-transparent border-gray-700'
                    }`}
                  >

                    <View className="flex-row items-center flex-1 pr-2">
                      <View style={{ backgroundColor: member.color }} className="w-5 h-5 rounded-full mr-2 shadow-sm" />
                      <Text className={`text-xs font-semibold ${member.hasCrashed ? 'text-red-100' : 'text-gray-300'}`} numberOfLines={1}>
                          {member.name}
                      </Text>
                      {member.hasCrashed && (
                          <Feather name="alert-triangle" size={12} color="#fca5a5" className="ml-1.5" />
                      )}
                    </View>

                    <View className="flex-row items-center pr-1">
                      <TouchableOpacity
                        onPress={() => toggleMemberVisibility(member.id)}
                        className={`rounded-full w-7 h-7 items-center justify-center ${member.hasCrashed ? 'bg-red-900/60' : 'bg-gray-600/50'}`}
                      >
                        <Feather name={member.isVisible ? "eye" : "eye-off"} size={12} color={member.hasCrashed ? '#fca5a5' : 'white'} />
                      </TouchableOpacity>
                      <TouchableOpacity className="w-6 items-center">
                        <Text className={`${member.hasCrashed ? 'text-red-300' : 'text-gray-400'} text-lg leading-none`}>-</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bottom Swipe-to-Stop Overlay */}
        <View pointerEvents="box-none" className="flex-1 justify-end items-center pb-[10%]">
          <SwipeButton
            key="stop"
            text="Fahrt Beenden"
            direction="left"
            sliderColor="#facc15" // Amber/Yellow
            containerColor="rgba(11, 19, 38, 0.85)"
            textColor="#9ca3af"
            onSwipeSuccess={() => setRideState('IDLE')}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

