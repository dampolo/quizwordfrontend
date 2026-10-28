import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function AllQuizzes() {

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <Text>All Quizzes</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
