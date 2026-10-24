import { useMemo } from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import PublicLayout from "../layouts/PublicLayout";
import { useTranslation } from "react-i18next";
import { createWebsiteStyles } from "./website.styles";
import { colors } from "../styles/basic";
import World from "../../assets/icons/world.svg";
import Progress from "../../assets/icons/progress.svg";

export default function Website() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const compact = width <= 992;
  const s = useMemo(() => createWebsiteStyles(width, height), [width, height]);
  return (
    <PublicLayout>
      <View style={s.hero} testID="website-hero">
        <View style={[s.container, s.heroRow, !compact && s.wideRow]}>
          <View style={s.heroContent}>
            <View style={s.badge}>
              <Text style={s.badgeText}>✦ {t("WEBSITE.HERO.BADGE")}</Text>
            </View>
            <Text accessibilityRole="header" style={s.title}>
              {t("WEBSITE.HERO.TITLE")} <Text style={s.accent}>Quiz Word</Text>
            </Text>
            <Text style={s.description}>{t("WEBSITE.HERO.SUBTITLE")}</Text>
            <View style={s.buttons}>
              <Link href="https://quiz-word.com/create-account" asChild>
                <Pressable accessibilityRole="link" style={s.heroButton}>
                  {({ pressed }) => <Text style={[s.heroButtonText, pressed && s.pressed]}>{`${t("WEBSITE.HERO.REGISTER")} →`}</Text>}
                </Pressable>
              </Link>
              <Link href="/quiz/(auth)/login-quiz" asChild>
                <Pressable accessibilityRole="link" style={s.heroButtonSecond}>
                  {({ pressed }) => <Text style={[s.heroButtonSecondText, pressed && s.pressed]}>{t("WEBSITE.HERO.LOGIN")}</Text>}
                </Pressable>
              </Link>
            </View>
          </View>
          {!compact && (
            <View style={[s.board, s.boardWide]}>
              <Image
                source={require("../../assets/images/learning-board.png")}
                style={s.boardImage}
                resizeMode="cover"
                accessibilityLabel={t("MOBILE.BOARD_LABEL")}
              />
              <Text style={s.boardCaption}>{t("MOBILE.BOARD_CAPTION")}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={s.steps} testID="website-features">
        <View style={s.container}>
          <View style={s.stepsHeading}>
            <Text accessibilityRole="header" style={s.stepsTitle}>
              {t("WEBSITE.HOW_IT_WORKS.TITLE")}
            </Text>
            <Text style={s.stepsDescription}>
              {t("WEBSITE.HOW_IT_WORKS.DESCRIPTION")}
            </Text>
          </View>
          <View style={s.cards}>
            <View style={[s.featureCard, compact && { minWidth: 193 }]}>
              <View style={[s.featureIcon, { backgroundColor: "#ede9fe" }]}>
                <World width={24} height={24} color={colors.qwPrimary} aria-hidden />
              </View>
              <Text accessibilityRole="header" style={s.featureTitle}>
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.CHOOSE_ANYWHERE.TITLE")}
              </Text>
              <Text style={s.featureDescription}>
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.CHOOSE_ANYWHERE.DESCRIPTION")}
              </Text>
            </View>
            <View style={[s.featureCard, compact && { minWidth: 218 }]}>
              <View style={[s.featureIcon, { backgroundColor: "#d1fae5" }]}>
                <Progress width={24} height={24} color={colors.qwPrimary} aria-hidden />
              </View>
              <Text accessibilityRole="header" style={s.featureTitle}>
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.SMART_QUIZZES.TITLE")}
              </Text>
              <Text style={s.featureDescription}>
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.SMART_QUIZZES.DESCRIPTION")}
              </Text>
            </View>
            <View style={[s.featureCard, compact && { minWidth: 203 }]}>
              <View style={[s.featureIcon, { backgroundColor: "#fde7c7" }]}>
                <Progress width={24} height={24} color={colors.qwPrimary} aria-hidden />
              </View>
              <Text accessibilityRole="header" style={s.featureTitle}>
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.TRACK_PROGRESS.TITLE")}
              </Text>
              <Text style={s.featureDescription}>
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.TRACK_PROGRESS.DESCRIPTION")}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={s.workflow} testID="website-workflow">
        <View style={[s.container, s.workflowContainer]}>
          <View style={s.tutorial}>
            <Image
              source={require("../../assets/images/learning-board.png")}
              style={s.tutorialImage}
              resizeMode="cover"
              accessibilityLabel={t("MOBILE.BOARD_LABEL")}
            />
            <View style={s.tutorialCaption}>
              <Text style={s.tutorialText}>{t("MOBILE.BOARD_LABEL")}</Text>
            </View>
          </View>
          <View style={s.workflowContent}>
            <Text accessibilityRole="header" style={s.workflowTitle}>
              {t("WEBSITE.HOW_TO_USE_IT.TITLE")}
            </Text>
            <View style={s.step}>
              <Text style={s.number}>1</Text>
              <View style={s.stepText}>
                <Text accessibilityRole="header" style={s.stepTitle}>
                  {t("WEBSITE.HOW_TO_USE_IT.PICK_YOUR_WORDS.TITLE")}
                </Text>
                <Text style={s.stepDescription}>
                  {t("WEBSITE.HOW_TO_USE_IT.PICK_YOUR_WORDS.DESCRIPTION")}
                </Text>
              </View>
            </View>
            <View style={s.step}>
              <Text style={s.number}>2</Text>
              <View style={s.stepText}>
                <Text accessibilityRole="header" style={s.stepTitle}>
                  {t("WEBSITE.HOW_TO_USE_IT.CREATE_YOUR_QUIZ.TITLE")}
                </Text>
                <Text style={s.stepDescription}>
                  {t("WEBSITE.HOW_TO_USE_IT.CREATE_YOUR_QUIZ.DESCRIPTION")}
                </Text>
              </View>
            </View>
            <View style={s.step}>
              <Text style={s.number}>3</Text>
              <View style={s.stepText}>
                <Text accessibilityRole="header" style={s.stepTitle}>
                  {t("WEBSITE.HOW_TO_USE_IT.UNLOCK_YOUR_QUIZ.TITLE")}
                </Text>
                <Text style={s.stepDescription}>
                  {t("WEBSITE.HOW_TO_USE_IT.UNLOCK_YOUR_QUIZ.DESCRIPTION")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={s.journeySection} testID="website-journey">
        <View style={s.container}>
          <LinearGradient
            colors={[colors.qwSecondary, colors.qwPrimary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.journey}
          >
            <Text accessibilityRole="header" style={s.journeyTitle}>
              {t("WEBSITE.CTA.TITLE")}
            </Text>
            <Text style={s.journeyText}>{t("WEBSITE.CTA.DESCRIPTION")}</Text>
            <Link href="https://quiz-word.com/create-account" asChild>
              <Pressable accessibilityRole="link" style={s.journeyButton}>
                {({ pressed }) => <Text style={[s.journeyButtonText, pressed && s.pressed]}>{t("WEBSITE.CTA.BUTTON")}</Text>}
              </Pressable>
            </Link>
          </LinearGradient>
        </View>
      </View>
    </PublicLayout>
  );
}
