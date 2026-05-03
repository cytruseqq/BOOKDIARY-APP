import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useStore, UserProfile } from '../store/useStore';
import { Colors, STATUS_LABELS } from '../lib/constants';
import StarRating from '../components/StarRating';

interface UserBook {
  title: string;
  author: string;
  rating: number | null;
  date_added: string;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { currentUser, follows, followUser, unfollowUser, fetchUserProfile } =
    useStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    finished: 0,
    reading: 0,
    toRead: 0,
    avgRating: 0,
  });

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Fetch profile
      const fetchedProfile = await fetchUserProfile(userId);
      setProfile(fetchedProfile);

      // Fetch user's books
      const { data: booksData } = await supabase
        .from('books')
        .select('title, author, rating, date_added, status')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (booksData) {
        setBooks(booksData);

        // Calculate stats
        const finished = booksData.filter(
          (b: any) => b.status === 'finished'
        );
        const reading = booksData.filter(
          (b: any) => b.status === 'reading'
        );
        const toRead = booksData.filter(
          (b: any) => b.status === 'to_read'
        );

        const ratedBooks = finished.filter((b: any) => b.rating);
        const avgRating =
          ratedBooks.length > 0
            ? ratedBooks.reduce((sum: number, b: any) => sum + b.rating, 0) /
              ratedBooks.length
            : 0;

        setStats({
          total: booksData.length,
          finished: finished.length,
          reading: reading.length,
          toRead: toRead.length,
          avgRating: Number(avgRating.toFixed(1)),
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFollowing =
    follows.some((f) => f.following_id === userId) || false;

  const handleFollow = async () => {
    if (!userId) return;

    if (isFollowing) {
      Alert.alert(
        'Przestań obserwować',
        `Czy chcesz usunąć ${profile?.username} z obserwowanych?`,
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Usuń',
            style: 'destructive',
            onPress: () => unfollowUser(userId),
          },
        ]
      );
    } else {
      await followUser(userId);
      Alert.alert(
        'Sukces',
        `${profile?.username} został dodany do obserwowanych`
      );
    }
  };

  const handleAddBook = async (book: UserBook) => {
    const { addBook } = useStore.getState();
    await addBook({
      title: book.title,
      author: book.author,
      status: 'to_read',
      rating: null,
      notes: null,
    });
    Alert.alert(
      'Dodano!',
      `"${book.title}" zostało dodane do Twojej listy`
    );
  };

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {profile.username}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followBtn,
                isFollowing && styles.followBtnActive,
              ]}
              onPress={handleFollow}
            >
              <Ionicons
                name={
                  isFollowing
                    ? 'person-remove-outline'
                    : 'person-add-outline'
                }
                size={18}
                color={isFollowing ? Colors.secondary : '#fff'}
              />
              <Text style={styles.followBtnText}>
                {isFollowing ? 'Obserwujesz' : 'Obserwuj'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Wszystkich</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.finished}</Text>
            <Text style={styles.statLabel}>Przeczytanych</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.reading}</Text>
            <Text style={styles.statLabel}>Czytanych</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Średnia ocena</Text>
          </View>
        </View>

        {/* Books */}
        <Text style={styles.sectionTitle}>📚 Przeczytane książki</Text>
        {books.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyText}>
              Ten użytkownik nie ma jeszcze książek
            </Text>
          </View>
        ) : (
          <FlatList
            data={books.filter((b: any) => b.status === 'finished')}
            keyExtractor={(_, i) => String(i)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.bookCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.bookAuthor}>{item.author}</Text>
                  {item.rating ? (
                    <StarRating rating={item.rating} size={14} readonly />
                  ) : null}
                  <Text style={styles.bookDate}>
                    {new Date(item.date_added).toLocaleDateString(
                      'pl-PL'
                    )}
                  </Text>
                </View>
                {!isOwnProfile && (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddBook(item)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color={Colors.primary}
                    />
                    <Text style={styles.addBtnText}>Dodaj</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  inner: { padding: 16, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  username: { fontSize: 22, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginBottom: 14 },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  followBtnActive: { backgroundColor: Colors.secondary },
  followBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  bookCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bookDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    marginLeft: 8,
  },
  addBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
});