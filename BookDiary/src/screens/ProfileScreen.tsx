import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Colors } from '../lib/constants';

export default function ProfileScreen() {
  const { currentUser, books } = useStore();
  const username =
    currentUser?.user_metadata?.username ||
    currentUser?.email ||
    'Użytkownik';
  const email = currentUser?.email || '';

  const finished = books.filter((b) => b.status === 'finished').length;
  const thisYear = new Date().getFullYear();
  const finishedThisYear = books.filter(
    (b) =>
      b.status === 'finished' &&
      new Date(b.date_added).getFullYear() === thisYear
  ).length;

  const handleLogout = () => {
    Alert.alert(
      'Wyloguj się',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{books.length}</Text>
          <Text style={styles.statLabel}>Wszystkich</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{finished}</Text>
          <Text style={styles.statLabel}>Przeczytanych</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{finishedThisYear}</Text>
          <Text style={styles.statLabel}>
            W {thisYear} r.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konto</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoLabel}>Nazwa użytkownika</Text>
            <Text style={styles.infoValue}>{username}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={Colors.secondary}
        />
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  username: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  divider: { width: 1, backgroundColor: Colors.border },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  infoLabel: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.secondary },
});
