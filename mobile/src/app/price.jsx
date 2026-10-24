import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';
import { priceStyles } from '../styles/price';
import PublicLayout from '../layouts/PublicLayout';
import { styles } from '../styles/styles';
import { resets } from '../styles/resets';

export default function Price() {
  const { t } = useTranslation();
  return (
    <PublicLayout>
      <View style={[styles.container, styles.section]}>
        <Text accessibilityRole="header" style={styles.heading}>{t('MOBILE.PRICE_TITLE')}</Text>
        <View style={styles.card}>
          <Text style={styles.title}>0 €</Text>
          <Text style={resets.text}>{t('MOBILE.FREE')}</Text>
          <Link href="https://quiz-word.com/create-account" asChild>
            <Pressable accessibilityRole="link" style={priceStyles.registerButton}>
              {({ pressed }) => <Text style={[priceStyles.registerButtonText, pressed && styles.pressed]}>{t('WEBSITE.CTA.BUTTON')}</Text>}
            </Pressable>
          </Link>
        </View>
      </View>
    </PublicLayout>
  );
}
