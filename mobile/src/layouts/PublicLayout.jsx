import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header/header';
import Footer from '../components/Footer/footer';
import { resets } from '../styles/resets';

export default function PublicLayout({ children, showHeader = true }) {
  return (
    <SafeAreaView
      style={resets.screen}
      edges={showHeader ? ['top', 'right', 'bottom', 'left'] : ['right', 'bottom', 'left']}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {showHeader && <Header />}
        {children}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}
