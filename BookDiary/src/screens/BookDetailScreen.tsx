import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useStore, Book } from '../store/useStore';
import { Colors, STATUS_LABELS } from '../lib/constants';
import StarRating from '../components/StarRating';

interface OtherReader {
  user_id: string;
  username: string;
  rating: number | null;
  date_added: string;
}

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    books,
    updateBook,
    deleteBook,
    currentUser,
    follows,
    followUser,
    unfollowUser,
  } = useStore();

  const book = books.find((b) => b.id === id);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(book?.status || 'to_read');
  const [rating, setRating] = useState(book?.rating || 0);
  const [notes, setNotes] = useState(book?.notes || '');
  const [readers, setReaders] = useState<OtherReader[]>([]);
  const [loadingReaders, setLoadingReaders] = useState(false);

  useEffect(() => {
    if (book) {
      fetchOtherReaders();
    }
  }, [book]);

  const fetchOtherReaders = async () => {
    if (!book) return;
    setLoadingReaders(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('user_id, rating, date_added')
        .eq('title', book.title)
        .eq('author', book.author)
        .eq('status', 'finished')
        .neq('user_id', currentUser?.id);

      if (!error && data) {
        const enriched: OtherReader[] = (data as any[]).map((row: any) => ({
          user_id: row.user_id,
          username: 'Czytelnik_' + row.user_id.substring(0, 8),
          rating: row.rating,
          date_added: row.date_added,
        }));
        setReaders(enriched);
        console.log('Other readers loaded:', enriched);
      } else {
        console.error('Error fetching other readers:', error?.message);
      }
    } catch (err) {
      console.error('Exception fetching other readers:', err);
    }
    setLoadingReaders(false);
  };

  const isFollowing = (userId: string) =>
    follows.some((f) => f.following_id === userId);

  const handleFollow = async (reader: OtherReader) => {
    if (isFollowing(reader.user_id)) {
      Alert.alert(
        'Przestań obserwować',
        `Czy chcesz usunąć ${reader.username} z obserwowanych?`,
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Usuń',
            style: 'destructive',
            onPress: () => unfollowUser(reader.user_id),
          },
        ]
      );
    } else {
      await followUser(reader.user_id);
      Alert.alert('Sukces', `${reader.username} został dodany do obserwowanych`);
    }
  };

  const handleOpenProfile = (reader: OtherReader) => {
    router.push({
      pathname: '/user-profile',
      params: { userId: reader.user_id },
    });
  };

  const handleSaveEdit = async () => {
    if (!book) return;
    await updateBook(book.id, {
      status: status as any,
      rating: rating || null,
      notes: notes || null,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!book) return;
    Alert.alert(
      'Usuń książkę',
      `Czy na pewno chcesz usunąć "${book.title}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deleteBook(book.id);
            router.back();
          },
        },
      ]
    );
  };

  if (!book)
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Nie znaleziono książki</Text>
      </View>
    );

  const STATUS_OPTIONS = [
    { value: 'to_read', label: 'Chcę przeczytać' },
    { value: 'reading', label: 'Czytam' },
    { value: 'finished', label: 'Przeczytane' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.card}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>{book.author}</Text>

          {editing ? (
            <>
              <Text style={styles.sectionLabel}>Status</Text>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusBtn,
                    status === opt.value && styles.statusBtnActive,
                  ]}
                  onPress={() => setStatus(opt.value as any)}
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
              <Text style={styles.sectionLabel}>Ocena</Text>
              <StarRating rating={rating} onRate={setRating} size={28} />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.cancelBtnText}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveBtnText}>Zapisz</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>
                    {STATUS_LABELS[book.status]}
                  </Text>
                </View>
                {book.rating ? (
                  <StarRating rating={book.rating} size={20} readonly />
                ) : (
                  <Text style={styles.noRating}>Brak oceny</Text>
                )}
              </View>
              {book.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Notatki</Text>
                  <Text style={styles.notesText}>{book.notes}</Text>
                </View>
              ) : null}
              <Text style={styles.dateText}>
                Dodano:{' '}
                {new Date(book.date_added).toLocaleDateString('pl-PL')}
              </Text>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditing(true)}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.editBtnText}>Edytuj</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👥 Inni czytelnicy</Text>
          {loadingReaders ? (
            <ActivityIndicator
              color={Colors.primary}
              style={{ marginVertical: 12 }}
            />
          ) : readers.length === 0 ? (
            <Text style={styles.noReaders}>
              Nikt jeszcze nie przeczytał tej książki
            </Text>
          ) : (
            <>
              <Text style={styles.readersCount}>
                {readers.length}{' '}
                {readers.length === 1
                  ? 'osoba przeczytała'
                  : 'osób przeczytało'}{' '}
                tę książkę
              </Text>
              {readers.map((reader) => (
                <TouchableOpacity
                  key={reader.user_id}
                  style={styles.readerRow}
                  onPress={() => handleOpenProfile(reader)}
                >
                  <View style={styles.readerAvatar}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.readerName}>{reader.username}</Text>
                    <View style={styles.readerMeta}>
                      {reader.rating ? (
                        <Text style={styles.readerRating}>
                          Ocena: {reader.rating}/5
                        </Text>
                      ) : null}
                      <Text style={styles.readerDate}>
                        {new Date(reader.date_added).toLocaleDateString(
                          'pl-PL'
                        )}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.followBtn,
                      isFollowing(reader.user_id) && styles.followBtnActive,
                    ]}
                    onPress={() => handleFollow(reader)}
                  >
                    <Ionicons
                      name={
                        isFollowing(reader.user_id)
                          ? 'person-remove-outline'
                          : 'person-add-outline'
                      }
                      size={14}
                      color={
                        isFollowing(reader.user_id)
                          ? Colors.secondary
                          : Colors.primary
                      }
                    />
                    <Text
                      style={[
                        styles.followBtnText,
                        isFollowing(reader.user_id) &&
                          styles.followBtnTextActive,
                      ]}
                    >
                      {isFollowing(reader.user_id)
                        ? 'Obserwujesz'
                        : 'Obserwuj'}
                    </Text>
                  </TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.textSecondary}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: Colors.textSecondary },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 56,
    backgroundColor: Colors.primary,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginHorizontal: 12,
  },
  inner: { padding: 16, paddingBottom: 40, gap: 14 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  bookAuthor: { fontSize: 16, color: Colors.textSecondary, marginBottom: 14 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  metaBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaBadgeText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  noRating: { fontSize: 13, color: Colors.textSecondary },
  notesBox: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notesText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  dateText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  statusBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  statusBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusTextActive: { color: Colors.primary, fontWeight: '700' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  noReaders: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  readersCount: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  readerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  readerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  readerName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  readerMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  readerRating: { fontSize: 12, color: Colors.textSecondary },
  readerDate: { fontSize: 12, color: Colors.textSecondary },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 4,
  },
  followBtnActive: { borderColor: Colors.secondary },
  followBtnText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  followBtnTextActive: { color: Colors.secondary },
});
