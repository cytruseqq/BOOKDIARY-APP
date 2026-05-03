import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../store/useStore';
import { Colors, STATUS_LABELS } from '../lib/constants';
import StarRating from './StarRating';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onDelete?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  to_read: Colors.statusToRead,
  reading: Colors.statusReading,
  finished: Colors.statusFinished,
};

export default function BookCard({ book, onPress, onDelete }: BookCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[book.status] }]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[book.status] + '22' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[book.status] }]}>
              {STATUS_LABELS[book.status]}
            </Text>
          </View>
          {book.rating ? (
            <StarRating rating={book.rating} size={14} readonly />
          ) : null}
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color={Colors.secondary} />
        </TouchableOpacity>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  left: {
    marginRight: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  author: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    marginRight: 8,
    padding: 2,
  },
});
