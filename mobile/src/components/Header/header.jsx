import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Logo from '../Logo/logo';
import { styles } from '../../styles/styles';
import { header } from './header.styles';

export default function Header() {
  const { t, i18n } = useTranslation();
  const compact = useWindowDimensions().width <= 992;

  return (
    <View style={header.header}>
      <View style={[styles.container, compact && header.mobileContainer]}>
        <View style={header.row}>
          <Link href="/" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel={t('MOBILE.HOME_LABEL')} style={header.brandLink}>
              <Logo size={compact ? 80 : 56} />
              {!compact && <Text style={header.brand}>Quiz Word</Text>}
            </Pressable>
          </Link>
          <Link href="/quiz/(auth)/login-quiz" style={[header.link, compact && header.mobileLogin]}>
            {t('MOBILE.LOGIN')}
          </Link>
        </View>
        {!compact && <View style={header.navigation}>
          <Link href="/" style={header.link}>{t('MOBILE.HOME')}</Link>
          <Link href="/price" style={header.link}>{t('HEADER.PRICE')}</Link>
          <Link href="/help-desk" style={header.link}>{t('FOOTER.FAQ')}</Link>
          <Link href="/contact" style={header.link}>{t('FOOTER.CONTACT')}</Link>
        </View>}
        {!compact && <View style={header.actions}>
          <View style={header.languages} accessibilityLabel={t('MOBILE.LANGUAGE')}>
            {['de', 'en'].map((language) => (
              <Pressable
                key={language}
                accessibilityRole="button"
                accessibilityLabel={language === 'de' ? 'Deutsch' : 'English'}
                accessibilityState={{ selected: i18n.resolvedLanguage === language }}
                onPress={() => i18n.changeLanguage(language)}
              >
                <Text style={[header.link, i18n.resolvedLanguage === language && header.activeLanguage]}>
                  {language.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          <Link href="https://quiz-word.com/create-account" asChild>
            <Pressable accessibilityRole="link" style={header.registerButton}>
              {({ pressed }) => <Text style={[header.registerButtonText, pressed && styles.pressed]}>{t('WEBSITE.HERO.REGISTER')}</Text>}
            </Pressable>
          </Link>
        </View>}
      </View>
    </View>
  );
}
