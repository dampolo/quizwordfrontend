import { Link } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../ScreenHeader/screen-header';
import { imprint } from './imprint.styles';

export default function Imprint() {
  return (
    <SafeAreaView style={imprint.screen} edges={['right', 'bottom', 'left']}>
      <ScreenHeader title="Impressum" />
      <ScrollView contentContainerStyle={imprint.content}>
        <Text accessibilityRole="header" style={imprint.heading}>Angaben gemäß § 5 DDG</Text>

        <Text selectable style={imprint.text}>
          <Text style={imprint.strong}>Quiz Word</Text>
          {"\n"}
          Damian Poloczek
          {"\n"}
          Chiemgaustraße 156
          {"\n"}
          81549 München
          {"\n"}
          Deutschland
        </Text>

        <Text accessibilityRole="header" style={imprint.heading}>Kontakt</Text>

        <Text selectable style={imprint.text}>
          Telefon: <Link href="tel:+4917699492988" style={imprint.link}>+49 176 99492988</Link>
          {"\n"}
          E-Mail:{" "}
          <Link href="mailto:support@quiz-word.com" style={imprint.link}>
            support@quiz-word.com
          </Link>
        </Text>

        <Text accessibilityRole="header" style={imprint.heading}>Verantwortlich für den Inhalt</Text>

        <Text selectable style={imprint.text}>
          Damian Poloczek
          {"\n"}
          Chiemgaustraße 156
          {"\n"}
          81549 München
        </Text>

        <Text accessibilityRole="header" style={imprint.heading}>EU-Streitschlichtung</Text>

        <Text selectable style={imprint.text}>
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:
        </Text>

        <Text selectable style={imprint.text}>
          <Link href="https://ec.europa.eu/consumers/odr/" style={imprint.link}>
            https://ec.europa.eu/consumers/odr/
          </Link>
        </Text>

        <Text selectable style={imprint.text}>Unsere E-Mail-Adresse finden Sie oben im Impressum.</Text>

        <Text accessibilityRole="header" style={imprint.heading}>Verbraucherstreitbeilegung</Text>

        <Text selectable style={imprint.text}>
          Wir sind weder verpflichtet noch bereit, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </Text>

        <Text accessibilityRole="header" style={imprint.heading}>Haftung für Inhalte</Text>

        <Text selectable style={imprint.text}>
          Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
          übernehmen wir jedoch keine Gewähr.
        </Text>

        <Text accessibilityRole="header" style={imprint.heading}>Haftung für Links</Text>

        <Text selectable style={imprint.text}>
          Diese Website enthält Links zu externen Webseiten Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte keine Gewähr übernehmen.
        </Text>

        <Text accessibilityRole="header" style={imprint.heading}>Urheberrecht</Text>

        <Text selectable style={imprint.text}>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
          dieser Website unterliegen dem deutschen Urheberrecht. Jede
          Vervielfältigung, Bearbeitung oder Verbreitung außerhalb der Grenzen
          des Urheberrechts bedarf der schriftlichen Zustimmung des jeweiligen
          Autors.
        </Text>

        <Text selectable style={imprint.text}>
          Quelle:{" "}
          <Link href="https://www.e-recht24.de" style={imprint.link}>
            eRecht24
          </Link>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
