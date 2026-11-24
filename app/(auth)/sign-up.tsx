import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/features/auth/services/auth.service';
import { signUpSchema } from '@/features/auth/schemas/auth.schema';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSignUp() {
    const parsed = signUpSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      Alert.alert('Check your details', parsed.error.issues[0]?.message ?? 'Invalid input.');
      return;
    }

    setBusy(true);
    try {
      const result = await authService.signUp(parsed.data);
      if (!result.session) {
        Alert.alert('Check your email', 'If email confirmation is enabled, follow the confirmation link to finish creating your account.');
      }
    } catch (error) {
      Alert.alert('Unable to create account', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 px-6">
      <View className="mx-auto w-full max-w-md gap-5">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-900">Create account</Text>
          <Text className="text-base text-slate-600">Your profile will be created automatically.</Text>
        </View>
        <View className="gap-3">
          <TextInput
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base"
            autoCapitalize="none"
            placeholder="Password (at least 8 characters)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable className="items-center rounded-xl bg-brand-600 px-4 py-3" disabled={busy} onPress={handleSignUp}>
            {busy ? <ActivityIndicator color="white" /> : <Text className="font-semibold text-white">Create account</Text>}
          </Pressable>
        </View>
        <Text className="text-center text-slate-600">
          Already registered? <Link className="font-semibold text-brand-600" href="/(auth)/sign-in">Sign in</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
