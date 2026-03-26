import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGyroscopeLogic } from '../functionality/gyroscopeDaten';

export default function App() {
  const {
    data: { x, y, z, timestamp },
    maxSpeeds,
    resetMax,
    subscription,
    _slow,
    _fast,
    _subscribe,
    _unsubscribe,
  } = useGyroscopeLogic();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Gyroscope:</Text>
      <Text style={styles.text}>timestamp: {timestamp}</Text>
      <Text style={styles.text}>x: {x.toFixed(3)} (Max: {maxSpeeds.maxX.toFixed(3)})</Text>
      <Text style={styles.text}>y: {y.toFixed(3)} (Max: {maxSpeeds.maxY.toFixed(3)})</Text>
      <Text style={styles.text}>z: {z.toFixed(3)} (Max: {maxSpeeds.maxZ.toFixed(3)})</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetMax} style={styles.button}>
          <Text>Reset Max</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
