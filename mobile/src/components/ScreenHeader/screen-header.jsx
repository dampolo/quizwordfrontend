import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import ArrowLeft from '../../../assets/icons/arrow-left.svg';
import { colors } from '../../styles/basic';
import Logo from '../Logo/logo';

export default function ScreenHeader({ title, fallbackHref = '/website', titleStyle }) {
  const { t } = useTranslation();

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  }

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerTitleStyle: titleStyle,
        headerTitleAlign: 'center',

        headerBackVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.qwThird },
        headerLeft: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('MOBILE.GO_BACK')}
            hitSlop={12}
            style={({ hovered, pressed }) => ({ opacity: hovered || pressed ? 0.6 : 1 })}
            onPress={goBack}
          >
            <ArrowLeft width={32} height={32} />
          </Pressable>

        ),
        headerRight: () => (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t('MOBILE.HOME_LABEL')}
            hitSlop={6}
            onPress={() => router.navigate('/website')}
            style={({ hovered, pressed }) => ({ marginRight: 8, opacity: hovered || pressed ? 0.6 : 1 })}
          >
            <Logo size={40} />
          </Pressable>
        ),
      }}
    />
  );
}
