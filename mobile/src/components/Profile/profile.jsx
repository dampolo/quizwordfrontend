import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileIcon from "../../../assets/icons/profile.svg";
import ScreenHeaderCustomer from "../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { profileStyles } from "./profile.styles";

const personalDetails = [
  ["Kundennummer", "QW-100024"],
  ["Anrede", "Herr"],
  ["Vorname", "Max"],
  ["Nachname", "Mustermann"],
  ["Telefon", "+49 151 12345678"],
  ["Straße", "Musterstraße"],
  ["Hausnummer", "12"],
  ["Stadt", "Berlin"],
  ["Postleitzahl", "10115"],
  ["Abonnement", "Ja"],
  ["Beschreibung", "Ich lerne gerne neue Sprachen mit Quizword."],
  ["Aktiv", "Ja"],
  ["Erstellt am", "01.10.2026"],
];


function InfoRow({ label, value }) {
  return (
    <View style={profileStyles.row}>
      <Text style={profileStyles.label}>{label}</Text>
      <Text selectable style={profileStyles.value}>{value}</Text>
    </View>
  );
}


function PreviewButton({ label = "Bearbeiten", destructive = false }) {
  return (
    <Pressable
      disabled
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      style={[profileStyles.button, destructive && profileStyles.deleteButton]}
    >
      <Text style={[profileStyles.buttonText, destructive && profileStyles.deleteButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}


function ProfileSection({ title, children, editable = true }) {
  return (
    <View style={profileStyles.section}>
      <Text accessibilityRole="header" style={profileStyles.sectionTitle}>{title}</Text>
      <View style={profileStyles.card}>
        {children}
        {editable && <PreviewButton />}
      </View>
    </View>
  );
}


export default function Profile() {
  return (
    <SafeAreaView style={profileStyles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeaderCustomer title="Profil" />
      <ScrollView contentContainerStyle={profileStyles.content}>
        <Text style={profileStyles.previewNotice}>
          Beispielprofil mit festen Daten. Bearbeiten und Löschen sind in dieser Vorschau deaktiviert.
        </Text>

        <ProfileSection title="Foto" >
          <View style={profileStyles.avatar}>
            <ProfileIcon width={100} height={100} accessibilityLabel="Beispiel-Profilbild" />
          </View>
        </ProfileSection>

        <ProfileSection title="Deine Daten">
          {personalDetails.map(([label, value]) => (
            <InfoRow key={label} label={label} value={value} />
          ))}
        </ProfileSection>

        <ProfileSection title="Benutzername ändern">
          <InfoRow label="Benutzername" value="max.mustermann" />
        </ProfileSection>

        <ProfileSection title="E-Mail-Adresse ändern">
          <InfoRow label="E-Mail" value="max@example.com" />
        </ProfileSection>

        <ProfileSection title="Passwort ändern">
          <InfoRow label="Passwort" value="**********" />
        </ProfileSection>

        <ProfileSection title="Deine Sprachen">
          <InfoRow label="Deine Muttersprache" value="Deutsch" />
          <InfoRow label="Deine Lernsprachen" value={"Englisch\nSpanisch"} />
        </ProfileSection>

        <ProfileSection title="Anmeldung" editable={false}>
          <Text style={profileStyles.body}>
            Du bist mit deiner E-Mail-Adresse max@example.com angemeldet.
          </Text>
        </ProfileSection>

        <ProfileSection title="Lösche dein Konto" editable={false}>
          <Text style={profileStyles.body}>
            Wenn du dein Konto löschst, werden alle deine Wörter, Quizze und Kategorien entfernt.
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Text>
          <PreviewButton label="Konto löschen" destructive />
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}
