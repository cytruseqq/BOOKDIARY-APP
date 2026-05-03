import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors } from '../lib/constants';
import StarRating from '../components/StarRating';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({
  icon,
  label,
  value,
  color = Colors.primary,
}: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { books, fetchBooks } = useStore();

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const thisYear = new Date().getFullYear();
  const finished = books.filter((b) => b.status === 'finished');
  const reading = books.filter((b) => b.status === 'reading');
  const toRead = books.filter((b) => b.status === 'to_read');
  const finishedThisYear = finished.filter(
    (b) => new Date(b.date_added).getFullYear() === thisYear
  );

  const ratedBooks = finished.filter((b) => b.rating != null);
  const avgRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) /
        ratedBooks.length
      : 0;

  const topBook =
    ratedBooks.length > 0
      ? ratedBooks.reduce((prev, curr) =>
          (curr.rating || 0) > (prev.rating || 0) ? curr : prev
        )
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Statystyki</Text>
        <Text style={styles.headerSub}>Twój postęp czytelniczy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.sectionTitle}>Ogólne</Text>
        <StatCard
          icon="library-outline"
          label="Wszystkie książki"
          value={books.length}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Przeczytane"
          value={finished.length}
          color={Colors.statusFinished}
        />
        <StatCard
          icon="calendar-outline"
          label={`Przeczytane w ${thisYear}`}
          value={finishedThisYear.length}
          color={Colors.accent}
        />
        <StatCard
          icon="star-outline"
          label="Średnia ocena przeczytanych"
          value={
            avgRating > 0
              ? `${avgRating.toFixed(1)}/5`
              : 'Brak ocen'
          }
          color={Colors.star}
        />

        <Text style={styles.sectionTitle}>Według statusu</Text>
        <View style={styles.statusGrid}>
          {[
            {
              label: 'Chcę przeczytać',
              count: toRead.length,
              color: Colors.statusToRead,
              icon: 'bookmark-outline',
            },
            {
              label: 'Czytam',
              count: reading.length,
              color: Colors.statusReading,
              icon: 'book-outline',
            },
            {
              label: 'Przeczytane',
              count: finished.length,
              color: Colors.statusFinished,
              icon: 'checkmark-done-outline',
            },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                styles.statusCard,
                {
                  backgroundColor: item.color + '18',
                  borderColor: item.color + '44',
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.color}
              />
              <Text style={[styles.statusCount, { color: item.color }]}>
                {item.count}
              </Text>
              <Text style={styles.statusLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {topBook && (
          <>
            <Text style={styles.sectionTitle}>🏆 Najwyżej oceniana</Text>
            <View style={styles.topBookCard}>
              <View style={styles.topBookBadge}>
                <Text style={styles.topBookBadgeText}>#{1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.topBookTitle}>{topBook.title}</Text>
                <Text style={styles.topBookAuthor}>
                  {topBook.author}
                </Text>
                <StarRating
                  rating={topBook.rating || 0}
                  size={18}
                  readonly
                />
              </View>
              <Text style={styles.topBookRating}>
                {topBook.rating}/5
              </Text>
            </View>
          </>
        )}

        {books.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="stats-chart-outline"
              size={60}
              color={Colors.border}
            />
            <Text style={styles.emptyText}>
              Brak danych. Dodaj pierwsze książki!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.primary,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  inner: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: { fontSize: 13, color: Colors.textSecondary },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  statusGrid: { flexDirection: 'row', gap: 8 },
  statusCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  statusCount: { fontSize: 24, fontWeight: '900' },
  statusLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  topBookCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  topBookBadge: {
    backgroundColor: Colors.star,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topBookBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  topBookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  topBookAuthor: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  topBookRating: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.star,
    marginLeft: 12,
  },
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
});
