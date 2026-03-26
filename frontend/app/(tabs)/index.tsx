import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Index() {
  const API_KEY = 'bf6kRWUoAyyCl2UMxaBC';

  // This is the HTML/JavaScript that will run inside your mobile app
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <script src="https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.umd.min.js"></script>
        <link href="https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.css" rel="stylesheet" />
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          maptilersdk.config.apiKey = '${API_KEY}';
          const map = new maptilersdk.Map({
            container: 'map',
            style: maptilersdk.MapStyle.OUTDOOR,
            center: [10.132438, 47.220528],
            zoom: 14,
            terrain: true,
            terrainControl: true,
            pitch: 70
          });

          map.on('load', () => {
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
                }
              }
            });
            map.addLayer({
              id: 'route-layer',
              type: 'line',
              source: 'route',
              paint: { 'line-color': '#ff0000', 'line-width': 5 }
            });
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});