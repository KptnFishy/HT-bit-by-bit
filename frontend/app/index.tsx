import { Text, View } from "react-native";
import Gyroscope from "../components/gyro";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Gyroscope />
    </View>
  );
}
