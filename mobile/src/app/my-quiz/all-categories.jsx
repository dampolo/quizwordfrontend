import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllCategories() {

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Text>All Categories</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
