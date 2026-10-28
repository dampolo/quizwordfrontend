import { Redirect } from "expo-router";
import { useAuth } from "../context/auth/useAuth";
import PreLoader from "../components/PreLoader/pre-loader";
import { styles } from '../styles/styles';
import { View } from 'react-native';


export default function Index() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return (
    <View style={styles.showContainer}>
        <PreLoader />
      </View>
  );

  return (
    <Redirect
      href={
        isAuthenticated
          ? "/my-quiz/all-words"
          : "/quiz/(auth)/login-quiz"
      }
    />
  );

}