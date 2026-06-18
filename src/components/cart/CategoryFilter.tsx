import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '@/colors';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.scrollView}
    contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = cat === selected;

        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              isActive && styles.activeChip,
            ]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                isActive && styles.activeChipText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  chip: {
    marginRight: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 0,
    maxHeight: 60,
},

  activeChip: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
    elevation: 3,
    shadowColor: Colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
  },

  activeChipText: {
    color: Colors.white,
    fontWeight: '600',
  },
});