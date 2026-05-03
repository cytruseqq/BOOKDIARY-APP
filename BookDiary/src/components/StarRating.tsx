import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../lib/constants';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  onRate?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({
  rating,
  maxStars = 5,
  onRate,
  size = 20,
  readonly = false,
}: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.round(rating);
        return readonly ? (
          <Ionicons
            key={i}
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? Colors.star : Colors.border}
          />
        ) : (
          <TouchableOpacity key={i} onPress={() => onRate && onRate(i + 1)}>
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={filled ? Colors.star : Colors.border}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
  },
});
