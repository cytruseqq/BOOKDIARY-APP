import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore, BookStatus, Book } from '../store/useStore';
import { Colors, STATUS_LABELS } from '../lib/constants';
import BookCard from '../components/BookCard';

const STATUS_OPTIONS: { value: BookStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'to_read', label: 'Chcę przeczytać' },
  { value: 'reading', label: 'Czytam' },
  { value: 'finished', label: 'Przeczytane' },
];

export default function MyBooksScreen() {
  const router = useRouter();
  const { books, fetchBooks, deleteBook, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await fetchBooks();
    setLoading(false);
  }, [fetchBooks]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  const thisYear = new Date().getFullYear();
  const finishedThisYear = books.filter(
    (b) =>
      b.status === 'finished' &&
      new Date(b.date_added).getFullYear() === thisYear
  ).length;

  const filtered = books
    .filter((b) => statusFilter === 'all' || b.status === statusFilter)
    .filter(
      (b) =>
        !search.trim() ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );

  const handleDelete = (book: Book) => {
    Alert.alert(
      'Usuń książkę',
      `Czy na pewno chcesz usunąć "${book.title}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => deleteBook(book.id),
        },
      ]
    );
  };

  const username =
    currentUser?.user_metadata?.username ||
    currentUser?.email ||
    'Użytkownik';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Cześć, {username} 👋</Text>
          <Text style={styles.subtitle}>Twoja biblioteka</Text>
        </View>
        <View style={styles.counterBox}>
          <Text style={styles.counterNum}>{finishedThisYear}</Text>
          <Text style={styles.counterLabel}>
            przeczytane{'\n'}w {thisYear}
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search-outline"
          size={18}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj po tytule lub autorze..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={STATUS_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterBtn,
                statusFilter === item.value && styles.filterBtnActive,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 8 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() =>
                router.push({
                  pathname: '/book-detail',
                  params: { id: item.id },
                })
              }
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="book-outline" size={60} color={Colors.border} />
              <Text style={styles.emptyText}>
                {search ? 'Brak wyników wyszukiwania' : 'Brak książek. Dodaj pierwszą!'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-book')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  counterBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  counterNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  counterLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  filterText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },
  list: { padding: 12, paddingBottom: 80 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
});
