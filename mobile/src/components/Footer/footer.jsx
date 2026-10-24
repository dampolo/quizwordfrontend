import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Platform, Pressable, Share, Text, useWindowDimensions, View } from 'react-native';
import Mail from '../../../assets/icons/mail.svg';
import ShareIcon from '../../../assets/icons/share.svg';
import { colors } from '../../styles/basic';
import { styles } from '../../styles/styles';
import { footer } from './footer.styles';

export default function Footer() {
  const { t } = useTranslation();
  const compact = useWindowDimensions().width <= 992;
  const [feedback, setFeedback] = useState('');

  async function handleShare() {
    setFeedback('');
    try {
      if (Platform.OS === 'web' && !globalThis.navigator?.share) {
        await globalThis.navigator.clipboard.writeText('https://quiz-word.com');
        setFeedback(t('MOBILE.LINK_COPIED'));
      } else {
        await Share.share({ title: 'Quiz Word', message: `${t('MOBILE.SHARE_TEXT')} https://quiz-word.com`, url: 'https://quiz-word.com' });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setFeedback(t('MOBILE.SHARE_ERROR'));
    }
  }

  return (
    <View style={footer.footer}>
      <View style={[styles.container, footer.container, !compact && footer.desktop]}>
        <View style={footer.brandGroup}>
          <Text style={footer.brand}>Quiz Word</Text>
          <Text style={footer.copyright}>© {new Date().getFullYear()} Quiz Word. {t('FOOTER.DESCRIPTION')}</Text>
        </View>
        <View style={footer.links}>
          <Link href="/imprint" style={footer.link}>{t('FOOTER.IMPRINT')}</Link>
          <Link href="/privacy-policy" style={footer.link}>{t('FOOTER.PRIVACY_POLICY')}</Link>
          <Link href="/help-desk" style={footer.link}>{t('FOOTER.FAQ')}</Link>
          <Link href="/contact" style={footer.link}>{t('FOOTER.CONTACT')}</Link>
        </View>
        <View style={footer.socials}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('MOBILE.SHARE')} onPress={handleShare} style={footer.social}>
            <ShareIcon width={24} height={24} color={colors.qwPrimary} aria-hidden />
          </Pressable>
          <Link href="mailto:support@quiz-word.com" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel={t('MOBILE.EMAIL')} style={footer.social}>
              <Mail width={24} height={24} color={colors.qwPrimary} aria-hidden />
            </Pressable>
          </Link>
        </View>
        {!!feedback && <Text accessibilityLiveRegion="polite" style={footer.feedback}>{feedback}</Text>}
      </View>
    </View>
  );
}
