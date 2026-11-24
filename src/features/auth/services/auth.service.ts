import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import type { SignInInput, SignUpInput } from '@/features/auth/schemas/auth.schema';

WebBrowser.maybeCompleteAuthSession();

export const authService = {
  async signInWithPassword(input: SignInInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    });
    if (error) throw error;
    return data;
  },

  async signUp(input: SignUpInput) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { full_name: input.fullName }
      }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async signInWithOAuth(provider: 'google' | 'apple') {
    const redirectTo = makeRedirectUri({
      scheme: 'rnssupabase',
      path: 'auth/callback'
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true
      }
    });

    if (error) throw error;
    if (!data.url) throw new Error('Supabase did not return an OAuth URL. Check provider configuration.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return;

    const callbackUrl = new URL(result.url);
    const callbackParams = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''));

    const callbackError =
      callbackUrl.searchParams.get('error_description') ??
      callbackParams.get('error_description');

    if (callbackError) throw new Error(callbackError);

    const code = callbackUrl.searchParams.get('code');
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
      return;
    }

    const accessToken =
      callbackUrl.searchParams.get('access_token') ??
      callbackParams.get('access_token');
    const refreshToken =
      callbackUrl.searchParams.get('refresh_token') ??
      callbackParams.get('refresh_token');

    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (sessionError) throw sessionError;
    }
  }
};
