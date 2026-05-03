import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore, BookStatus } from '../store/useStore';
import { Colors, STATUS_LABELS } from '../lib/constants';
import StarRating from '../components/StarRating';

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'to_read', label: 'Chcę przeczytać' },
  { value: 'reading', label: 'Czytam' },
  { value: 'finished', label: 'Przeczytane' },
];

export default function AddBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; author?: string }>();
  const { addBook } = useStore();

  const [title, setTitle] = useState(params.title || '');
  const [author, setAuthor] = useState(params.author || '');
  const [status, setStatus] = useState<BookStatus>('to_read');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Błąd', 'Tytuł i autor są wymagane');
      return;
    }
    setLoading(true);
    await addBook({
      title: title.trim(),
      author: author.trim(),
      status,
      rating: rating || null,
      notes: notes.trim() || null,
    });
    setLoading(false);
    Alert.alert('Sukces!', 'Książka została dodana');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Dodaj książkę</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Tytuł *</Text>
        <TextInput
          style={styles.input}
          placeholder="Wpisz tytuł książki"
          placeholderTextColor={Colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Autor *</Text>
        <TextInput
          style={styles.input}
          placeholder="Imię i nazwisko autora"
          placeholderTextColor={Colors.textSecondary}
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.statusBtn,
                status === opt.value && styles.statusBtnActive,
              ]}
              onPress={() => setStatus(opt.value)}
            >
              <Text
                style={[
                  styles.statusText,
                  status === opt.value && styles.statusTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ocena</Text>
        <View style={styles.ratingWrap}>
          <StarRating rating={rating} onRate={setRating} size={32} />
          {rating > 0 && (
            <TouchableOpacity
              onPress={() => setRating(0)}
              style={styles.clearRating}
            >
              <Text style={styles.clearRatingText}>Wyczyść</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Notatki</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Twoje przemyślenia, ulubione cytaty..."
          placeholderTextColor={Colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>Zapisz książkę</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 56,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  inner: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notesInput: { height: 120, paddingTop: 14 },
  statusRow: { flexDirection: 'column', gap: 8 },
  statusBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusTextActive: { color: Colors.primary, fontWeight: '700' },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clearRating: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  clearRatingText: { fontSize: 12, color: Colors.textSecondary },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    marginTop: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
