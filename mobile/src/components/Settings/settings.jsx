import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { resets } from "../../styles/resets";
import { styles } from "../../styles/styles";


export default function Settings() {
  return (
    <SafeAreaView style={resets.screen} edges={["top", "left", "right"]}>
      <ScreenHeaderCustomer horizontalInset={0} title="Einstellungen" />
      <View style={styles.container}>
        <Text style={resets.text}>Dieser Bereich ist in Arbeit.</Text>
      </View>
    </SafeAreaView>
  );
}
