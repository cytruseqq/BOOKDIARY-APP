import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../src/lib/supabase';
import { useStore } from '../src/store/useStore';

export default function RootLayout() {
  const { setCurrentUser, fetchBooks, fetchFollows } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        fetchBooks();
        fetchFollows();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        fetchBooks();
        fetchFollows();
      }
    });

    return () => subscription?.unsubscribe();
  }, [setCurrentUser, fetchBooks, fetchFollows]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-book" />
        <Stack.Screen name="book-detail" />
      </Stack>
    </>
  );
}
