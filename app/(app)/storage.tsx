import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { uploadAvatar } from '@/features/storage/services/storage.service';

export default function StorageScreen() {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function chooseAndUpload() {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo library access to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85
    });

    if (result.canceled || !result.assets[0]) return;

    setBusy(true);
    try {
      const uploaded = await uploadAvatar(user.id, result.assets[0].uri, result.assets[0].mimeType ?? 'image/jpeg');
      setImageUrl(uploaded.signedUrl);
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 pt-6">
      <View className="gap-4">
        <Text className="text-2xl font-bold text-slate-900">Supabase Storage</Text>
        <Text className="text-slate-600">Choose an image and upload it to your private avatars bucket.</Text>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="h-56 w-56 self-center rounded-2xl bg-slate-200" />
        ) : (
          <View className="h-56 w-56 items-center justify-center self-center rounded-2xl bg-slate-200">
            <Text className="text-slate-500">No uploaded image</Text>
          </View>
        )}
        <Pressable className="items-center rounded-xl bg-brand-600 px-4 py-3" onPress={chooseAndUpload} disabled={busy}>
          {busy ? <ActivityIndicator color="white" /> : <Text className="font-semibold text-white">Choose and upload image</Text>}
        </Pressable>
        <Text className="text-xs text-slate-500">Files are stored under your user ID. The bucket is private and the displayed URL is temporary.</Text>
      </View>
    </SafeAreaView>
  );
}
