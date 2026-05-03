import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors } from '../lib/constants';

export default function FollowingScreen() {
  const router = useRouter();
  const { follows, fetchFollows, unfollowUser } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollows();
  }, []);

  const loadFollows = async () => {
    setLoading(true);
    await fetchFollows();
    setLoading(false);
  };

  const handleUnfollow = (userId: string, username: string) => {
    Alert.alert(
      'Przestań obserwować',
      `Czy na pewno chcesz usunąć ${username} z obserwowanych?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => unfollowUser(userId),
        },
      ]
    );
  };

  const handleOpenProfile = (userId: string) => {
    router.push({
      pathname: '/user-profile',
      params: { userId },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Obserwowani</Text>
        <Text style={styles.headerSub}>
          {follows.length} {follows.length === 1 ? 'osoba' : 'osób'} w obserwowanych
        </Text>
      </View>

      <FlatList
        data={follows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={60} color={Colors.border} />
            <Text style={styles.emptyText}>
              Nie obserwujesz jeszcze nikogo.{'\n'}Znajdź czytelników w
              szczegółach książek!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const username = 'Czytelnik_' + item.following_id.substring(0, 8);
          return (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleOpenProfile(item.following_id)}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.since}>
                  Od {new Date(item.created_at).toLocaleDateString('pl-PL')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.unfollowBtn}
                onPress={() =>
                  handleUnfollow(item.following_id, username)
                }
              >
                <Ionicons
                  name="person-remove-outline"
                  size={16}
                  color={Colors.secondary}
                />
                <Text style={styles.unfollowText}>Usuń</Text>
              </TouchableOpacity>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  list: { padding: 12, paddingBottom: 20 },
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
  userCard: {
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  username: { fontSize: 15, fontWeight: '700', color: Colors.text },
  since: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  unfollowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  unfollowText: { fontSize: 12, fontWeight: '600', color: Colors.secondary },
});
