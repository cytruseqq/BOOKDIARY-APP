import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Colors } from '../lib/constants';

export default function RegisterScreen() {
  const router = useRouter();
  const { createOrUpdateProfile } = useStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Błąd', 'Hasła nie są zgodne');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Błąd rejestracji', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create profile after successful signup
        await createOrUpdateProfile(username.trim());

        Alert.alert('Sukces!', 'Konto zostało utworzone. Możesz się zalogować.', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Błąd', 'Nie udało się zarejestrować');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Utwórz konto</Text>
        <Text style={styles.subtitle}>Dołącz do społeczności czytelników</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nazwa użytkownika</Text>
          <TextInput
            style={styles.input}
            placeholder="np. bookworm123"
            placeholderTextColor={Colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="twoj@email.pl"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Hasło</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 znaków"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Potwierdź hasło</Text>
          <TextInput
            style={styles.input}
            placeholder="Powtórz hasło"
            placeholderTextColor={Colors.textSecondary}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Utwórz konto</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.switchText}>
              Masz już konto?{' '}
              <Text style={styles.switchBold}>Zaloguj się</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
  },
  switchBold: { color: Colors.primary, fontWeight: '700' },
});
