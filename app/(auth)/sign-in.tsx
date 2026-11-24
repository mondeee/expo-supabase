import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/features/auth/services/auth.service';
import { signInSchema } from '@/features/auth/schemas/auth.schema';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      Alert.alert('Check your details', parsed.error.issues[0]?.message ?? 'Invalid input.');
      return;
    }

    setBusy(true);
    try {
      await authService.signInWithPassword(parsed.data);
    } catch (error) {
      Alert.alert('Unable to sign in', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSocial(provider: 'google' | 'apple') {
    setBusy(true);
    try {
      await authService.signInWithOAuth(provider);
    } catch (error) {
      Alert.alert('Social sign-in unavailable', error instanceof Error ? error.message : 'Configure the provider in Supabase first.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 px-6">
      <View className="mx-auto w-full max-w-md gap-5">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-900">Welcome back</Text>
          <Text className="text-base text-slate-600">Sign in to your starter app.</Text>
        </View>

        <View className="gap-3">
          <TextInput
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900"
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            accessibilityRole="button"
            className="items-center rounded-xl bg-brand-600 px-4 py-3"
            disabled={busy}
            onPress={handleSignIn}
          >
            {busy ? <ActivityIndicator color="white" /> : <Text className="font-semibold text-white">Sign in</Text>}
          </Pressable>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-slate-200" />
          <Text className="text-xs uppercase text-slate-500">or continue with</Text>
          <View className="h-px flex-1 bg-slate-200" />
        </View>

        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3"
            disabled={busy}
            onPress={() => handleSocial('google')}
          >
            <Text className="text-center font-medium text-slate-800">Google</Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3"
            disabled={busy}
            onPress={() => handleSocial('apple')}
          >
            <Text className="text-center font-medium text-slate-800">Apple</Text>
          </Pressable>
        </View>

        <Text className="text-center text-slate-600">
          New here? <Link className="font-semibold text-brand-600" href="/(auth)/sign-up">Create an account</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
