import React from 'react';
import { StyleSheet, View, Dimensions, Platform, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Index() {
  // Your MapTiler API Key
  const API_KEY = 'bf6kRWUoAyyCl2UMxaBC';

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