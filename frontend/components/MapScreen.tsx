import React, { useEffect } from 'react';
import { View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

// Set your MapTiler API Key
const API_KEY = 'bf6kRWUoAyyCl2UMxaBC';
const STYLE_URL = `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${API_KEY}`;

// Example Route Data (GeoJSON)
const routeGeoJSON = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [8.947, 45.978], // Point A [lng, lat]
      [8.950, 45.980], // Point B
      [8.960, 45.985], // Point C
    ],
  },
};

export default function MapScreen() {
  return (
    // Tailwind class "flex-1" ensures the map fills the screen
    <View className="flex-1 bg-black">
      <MapLibreGL.MapView
        styleURL={STYLE_URL}
        className="flex-1"
        logoEnabled={false}
        attributionEnabled={true}
      >
        {/* Camera: Centers on your geopoint and sets the 3D pitch */}
        <MapLibreGL.Camera
          zoomLevel={14}
          centerCoordinate={[8.947, 45.978]}
          pitch={60} // Tilts the map for 3D view
          animationMode="flyTo"
        />

        {/* 3D Terrain Layer */}
        <MapLibreGL.Terrain
          sourceID="maptiler-terrain"
          exaggeration={1.5} // Makes mountains look more prominent
        />

        {/* Route Layer */}
        <MapLibreGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
          <MapLibreGL.LineLayer
            id="routeLayer"
            style={{
              lineColor: '#3b82f6', // Tailwind Blue-500
              lineWidth: 5,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </MapLibreGL.ShapeSource>
      </MapLibreGL.MapView>
    </View>
  );
}