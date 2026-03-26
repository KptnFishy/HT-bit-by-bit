import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SwipeButton } from '../../components/SwipeButton';

type RideState = 'IDLE' | 'RIDING' | 'CRASHED' | 'RESCUE';

export default function Index() {
  // Your MapTiler API Key
  const API_KEY = 'bf6kRWUoAyyCl2UMxaBC';

  const [rideState, setRideState] = useState<RideState>('IDLE');
  const [crashTimer, setCrashTimer] = useState(10);

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

  // The HTML and JS that powers the 3D Map
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
          /* Hide the default MapTiler inspect button if it overlaps */
          .maplibregl-ctrl-inspect { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            maptilersdk.config.apiKey = '${API_KEY}';
            
            const map = new maptilersdk.Map({
              container: 'map',
              style: maptilersdk.MapStyle.OUTDOOR, // Try SATELLITE if Outdoor is too bright
              center: [10.132438, 47.220528],
              zoom: 14,
              terrain: true,
              terrainControl: true,
              pitch: 70,
              maxPitch: 85,
              antialias: true
            });

            map.on('load', () => {
              // Add the Route Source
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      [10.120, 47.210],
                      [10.132438, 47.220528],
                      [10.145, 47.230]
                    ]
                  },
                  properties: {}
                }
              });

              // Add the Blue/Red Route Layer
              map.addLayer({
                id: 'route-layer',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#ff0000',
                  'line-width': 6,
                  'line-opacity': 0.8
                }
              });
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
      <WebView
        originWhitelist={['*']}
        // baseUrl is the MAGIC fix for white terrain on mobile
        source={{ html: mapHtml, baseUrl: 'https://www.maptiler.com' }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
      />

      {/* Top Left Crash Overlay */}
      <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View pointerEvents="box-none" className="pt-4 px-4 items-start">
          <TouchableOpacity
            onPress={() => {
              setCrashTimer(10);
              setRideState('CRASHED');
            }}
            className="bg-red-500/90 rounded-full px-5 py-3.5 flex-row items-center justify-center border border-red-400 gap-2 shadow-lg"
          >
            <Feather name="alert-triangle" size={14} color="white" />
            <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">Crash Simulieren</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Swipe-to-Stop Overlay */}
        <View pointerEvents="box-none" className="flex-1 justify-end items-center pb-[25%] px-5">
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
      </SafeAreaView>
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