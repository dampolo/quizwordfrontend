import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddNewWord() {

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Text>Add New Word</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
