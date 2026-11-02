import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import ProfileIcon from "../../../../assets/icons/profile.svg";
import { useAuth } from "../../../context/auth/useAuth";
import ScreenHeaderCustomer from "../../ScreenHeaderCustomer/ScreenHeaderCustomer";
import { changeProfileImageStyles } from "./change-profile-image.styles";

const imageTypes = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };


export default function ChangeProfileImage() {
  const { profile, updateProfile } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const busyRef = useRef(false);
  const imageUri = selectedImage?.uri || profile?.image;


  function showError(message) {
    setError(message);
    setNotice(message);
  }


  async function chooseImage() {
    if (busyRef.current) {
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 });
      if (result.canceled) {
        return;
      }
      const asset = result.assets[0];
      const extension = (asset.fileName || asset.uri.split("?")[0]).split(".").pop().toLowerCase();
      const mimeType = asset.mimeType || imageTypes[extension];
      if (!Object.values(imageTypes).includes(mimeType)) {
        showError("Bitte wähle ein PNG-, JPEG- oder WebP-Bild.");
        return;
      }
      setSelectedImage({ ...asset, mimeType });
      setError("");
    } catch {
      showError("Das Foto konnte nicht geöffnet werden. Bitte versuche es erneut.");
    }
  }


  async function saveImage(remove = false) {
    if (busyRef.current || (!remove && !selectedImage)) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      let payload = { image: null };
      if (!remove) {
        payload = new FormData();
        payload.append("image", {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `profile.${selectedImage.mimeType.split("/")[1]}`,
          type: selectedImage.mimeType,
        });
      }
      await updateProfile(payload);
      setSelectedImage(null);
      setNotice(remove ? "Das Profilbild wurde gelöscht." : "Das Profilbild wurde geändert.");
    } catch (failure) {
      const data = failure?.response?.data;
      const detail = data?.image || data?.detail || data?.non_field_errors || (typeof data === "string" ? data : null);
      const message = Array.isArray(detail) ? detail.filter((item) => typeof item === "string").join("\n") : detail;
      showError((typeof message === "string" && message) || "Das Profilbild konnte nicht geändert werden.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }


  function confirmDelete() {
    if (busyRef.current || !profile?.image) {
      return;
    }
    const message = "Möchtest du dein Profilbild wirklich löschen?";
    Alert.alert("Profilbild löschen", message, [
      { text: "Abbrechen", style: "cancel" },
      { text: "Löschen", style: "destructive", onPress: () => saveImage(true) },
    ], { cancelable: true });
  }


  return (
    <SafeAreaView style={changeProfileImageStyles.screen} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeaderCustomer title="Profilbild ändern" fallbackHref="/my-quiz/profile" />
      <ScrollView contentContainerStyle={changeProfileImageStyles.content}>
        <View style={changeProfileImageStyles.card}>
          <Text accessibilityRole="header" style={changeProfileImageStyles.title}>Ändere dein Foto</Text>
          <Text style={changeProfileImageStyles.body}>Wähle ein PNG-, JPEG- oder WebP-Bild mit maximal 2 MB.</Text>
          <View style={changeProfileImageStyles.avatar}>
            {imageUri ? <Image source={{ uri: imageUri }} style={changeProfileImageStyles.image} accessibilityLabel="Vorschau des Profilbildes" /> : <ProfileIcon width={120} height={120} />}
          </View>
          {selectedImage && <Text style={changeProfileImageStyles.body}>{selectedImage.fileName || "Ausgewähltes Foto"}</Text>}
          <Pressable accessibilityRole="button" disabled={busy} onPress={chooseImage} style={[changeProfileImageStyles.button, busy && changeProfileImageStyles.disabled]}>
            <Text style={changeProfileImageStyles.buttonText}>Foto wählen</Text>
          </Pressable>
          {!!error && <Text accessibilityRole="alert" style={changeProfileImageStyles.error}>{error}</Text>}
          {busy && <ActivityIndicator accessibilityLabel="Foto wird aktualisiert" />}
          <Pressable accessibilityRole="button" disabled={busy || !selectedImage} onPress={() => saveImage()} style={[changeProfileImageStyles.button, (busy || !selectedImage) && changeProfileImageStyles.disabled]}>
            <Text style={changeProfileImageStyles.buttonText}>Foto speichern</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy || !profile?.image} onPress={confirmDelete} style={[changeProfileImageStyles.deleteButton, (busy || !profile?.image) && changeProfileImageStyles.disabled]}>
            <Text style={changeProfileImageStyles.error}>Profilbild löschen</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Snackbar visible={!!notice} onDismiss={() => setNotice("")} action={{ label: "OK", onPress: () => setNotice("") }}>{notice}</Snackbar>
    </SafeAreaView>
  );
}
