import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useVocabulary from "@quizword/shared/vocabulary/useVocabulary";
import { useAuth } from "../../context/auth/useAuth";
import ProfileIcon from "../../../assets/icons/profile.svg";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { profileStyles } from "./profile.styles";
import { styles } from "../../styles/styles";

function InfoRow({ label, value }) {
  return (
    <View style={profileStyles.row}>
      <Text style={profileStyles.label}>{label}</Text>
      <Text selectable style={profileStyles.value}>
        {typeof value === "boolean"
          ? value
            ? "Ja"
            : "Nein"
          : String(value ?? "").trim() || "–"}
      </Text>
    </View>
  );
}

function PreviewButton({ label = "Bearbeiten", destructive = false, onPress }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [
        profileStyles.button,
        destructive && profileStyles.deleteButton,
        onPress && profileStyles.enabledButton,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          profileStyles.buttonText,
          destructive && profileStyles.deleteButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ProfileSection({ title, children, editable = true, onEdit }) {
  return (
    <View style={profileStyles.section}>
      <Text accessibilityRole="header" style={profileStyles.sectionTitle}>
        {title}
      </Text>
      <View style={profileStyles.card}>
        {children}
        {editable && <PreviewButton onPress={onEdit} />}
      </View>
    </View>
  );
}

export default function Profile() {
  const { profile, user } = useAuth();
  const { userLanguages, nativeLanguage } = useVocabulary();

  return (
    <SafeAreaView
      style={profileStyles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView contentContainerStyle={profileStyles.content}>
        <ScreenHeaderCustomer title="Profil" />
        <Text style={profileStyles.previewNotice}>
          Du kannst dein Foto, deine persönlichen Daten, deinen Benutzernamen
          und deine E-Mail-Adresse bearbeiten sowie dein Passwort und deine Sprachen ändern.
        </Text>

        {!profile && (
          <Text style={profileStyles.body}>Keine Profildaten verfügbar.</Text>
        )}

        <ProfileSection
          title="Foto"
          onEdit={() => router.push("/my-quiz/change-profile-image")}
        >
          <View style={profileStyles.avatar}>
            {profile?.image ? (
              <Image
                source={{ uri: profile.image }}
                style={profileStyles.avatarImage}
                accessibilityLabel="Profilbild"
              />
            ) : (
              <ProfileIcon
                width={100}
                height={100}
                accessibilityLabel="Profilbild"
              />
            )}
          </View>
        </ProfileSection>

        <ProfileSection
          title="Deine Daten"
          onEdit={() => router.push("/my-quiz/edit-profile")}
        >
          <InfoRow label="Kundennummer" value={profile?.customer_number} />
          <InfoRow label="Anrede" value={profile?.title} />
          <InfoRow label="Vorname" value={profile?.first_name} />
          <InfoRow label="Nachname" value={profile?.last_name} />
          <InfoRow label="Telefon" value={profile?.phone} />
          <InfoRow label="Straße" value={profile?.street} />
          <InfoRow label="Hausnummer" value={profile?.street_number} />
          <InfoRow label="Stadt" value={profile?.city} />
          <InfoRow label="Postleitzahl" value={profile?.postcode} />
          <InfoRow label="Abonnement" value={profile?.has_subscription} />
          <InfoRow label="Beschreibung" value={profile?.description} />
          <InfoRow label="Aktiv" value={profile?.is_active} />
          <InfoRow
            label="Erstellt am"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : null
            }
          />
        </ProfileSection>

        <ProfileSection
          title="Benutzername ändern"
          onEdit={() => router.push("/my-quiz/change-username")}
        >
          <InfoRow label="Benutzername" value={profile?.username} />
        </ProfileSection>

        <ProfileSection
          title="E-Mail-Adresse ändern"
          onEdit={() => router.push("/my-quiz/change-email")}
        >
          <InfoRow label="E-Mail" value={profile?.email} />
        </ProfileSection>

        <ProfileSection title="Passwort ändern" onEdit={() => router.push("/my-quiz/change-password")}>
          <InfoRow label="Passwort" value="**********" />
        </ProfileSection>

        <ProfileSection title="Deine Sprachen" onEdit={() => router.push("/my-quiz/edit-languages?redirect=true")}>
          <InfoRow
            label="Deine Muttersprache"
            value={nativeLanguage?.language_name}
          />
          <InfoRow
            label="Deine Lernsprachen"
            value={userLanguages
              ?.map((language) => language.language_name)
              .join("\n")}
          />
        </ProfileSection>

        {user?.auth_provider === "email" && (
          <ProfileSection title="Anmeldung" editable={false}>
            <Text style={profileStyles.body}>
              Du bist mit deiner E-Mail-Adresse {profile?.email || "–"}{" "}
              angemeldet.
            </Text>
          </ProfileSection>
        )}

        <ProfileSection title="Lösche dein Konto" editable={false}>
          <Text style={profileStyles.body}>
            Wenn du dein Konto löschst, werden alle deine Wörter, Quizze und
            Kategorien entfernt. Diese Aktion kann nicht rückgängig gemacht
            werden.
          </Text>
          <PreviewButton label="Konto löschen" destructive onPress={() => router.push("/my-quiz/delete-account")} />
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}
