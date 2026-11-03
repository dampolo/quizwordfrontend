import { Text } from "react-native";
import { confirmContactRedirect } from "../../services/contact";


export default function Contact() {
  return <Text accessibilityRole="link" onPress={confirmContactRedirect}>Kontakt</Text>;
}
