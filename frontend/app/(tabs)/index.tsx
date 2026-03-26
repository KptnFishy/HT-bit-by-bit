import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import * as maptilersdk from '@maptiler/sdk';

// IMPORTANT: Essential for 3D buttons and map scaling
import '@maptiler/sdk/dist/maptiler-sdk.css';

export default function Index() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);

  useEffect(() => {
    // 1. Guard against non-web environments
    if (Platform.OS !== 'web') return;
    if (map.current) return; 

    // 2. Set your API Key
    maptilersdk.config.apiKey = 'bf6kRWUoAyyCl2UMxaBC';

    if (mapContainer.current) {
      // 3. Initialize the 3D Map
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.OUTDOOR,
        center: [8.94738, 45.97812], // Geopoint (Swiss Alps area)
        zoom: 14,
        terrain: true,               // Enable 3D Terrain
        terrainControl: true,        // Enable the 3D toggle button
        pitch: 70,                   // 3D Tilt angle
        bearing: -100,               // Camera rotation
        maxPitch: 85,
      });

      // 4. Add a Route (Line) once the map loads
      map.current.on('load', () => {
        map.current?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [8.940, 45.970],
                [8.947, 45.978],
                [8.955, 45.985],
              ],
            },
          },
        });

        map.current?.addLayer({
          id: 'route-layer',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ff0000', // Red route line
            'line-width': 5,
          },
        });
      });
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* On Web, we render the div. On Mobile, we show a fallback message */}
      {Platform.OS === 'web' ? (
        <div ref={mapContainer} style={styles.mapWeb} />
      ) : (
        <View style={styles.fallback}>
          <Text>Please run this in a Web Browser</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapWeb: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  }
});