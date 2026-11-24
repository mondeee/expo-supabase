import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useMyProfile, useUpdateMyProfile } from '@/features/profile/hooks/use-profile';
import { authService } from '@/features/auth/services/auth.service';

export default function ProfileScreen() {
  const { user } = useAuth();
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const [fullName, setFullName] = useState<string | null>(null);

  const currentName = fullName ?? profileQuery.data?.full_name ?? '';

  async function saveProfile() {
    try {
      await updateProfile.mutateAsync(currentName);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Could not save profile', error instanceof Error ? error.message : 'Try again.');
    }
  }

  async function signOut() {
    try {
      await authService.signOut();
    } catch (error) {
      Alert.alert('Sign-out failed', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 pt-6">
      <View className="gap-4">
        <Text className="text-2xl font-bold text-slate-900">Your profile</Text>
        <View className="rounded-xl border border-slate-200 bg-white p-4">
          <Text className="text-xs font-semibold uppercase text-slate-500">Signed in as</Text>
          <Text className="mt-1 text-base text-slate-900">{user?.email}</Text>
          <Text className="mt-1 text-xs text-slate-500">{user?.id}</Text>
        </View>
        <View className="gap-2">
          <Text className="font-medium text-slate-800">Full name</Text>
          <TextInput
            className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            placeholder="Your name"
            value={currentName}
            onChangeText={setFullName}
          />
          <Pressable className="items-center rounded-xl bg-brand-600 px-4 py-3" onPress={saveProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <ActivityIndicator color="white" /> : <Text className="font-semibold text-white">Save profile</Text>}
          </Pressable>
        </View>
        <Pressable className="items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3" onPress={signOut}>
          <Text className="font-semibold text-red-700">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
