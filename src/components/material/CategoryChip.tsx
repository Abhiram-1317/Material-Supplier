import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import AppText from '../ui/AppText';
import {appTheme} from '../../theme/theme';
import {MaterialCategory} from '../../data/mockMaterials';

type CategoryChipProps = {
  category: MaterialCategory;
  selected?: boolean;
  onPress?: () => void;
};

export const CategoryChip: React.FC<CategoryChipProps> = ({category, selected = false, onPress}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        pressed && styles.chipPressed,
      ]}
    >
      <MaterialCommunityIcons
        name={(category.icon as any) || 'cube-outline'}
        size={18}
        color={selected ? appTheme.colors.surface : appTheme.colors.textSecondary}
        style={styles.icon}
      />
      <AppText
        variant="body"
        style={selected ? styles.textSelected : styles.textDefault}
      >
        {category.name}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    borderRadius: 999,
    marginRight: appTheme.spacing.sm,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
  },
  chipSelected: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  chipPressed: {
    opacity: 0.9,
  },
  icon: {
    marginRight: appTheme.spacing.xs,
  },
  textDefault: {
    color: appTheme.colors.textPrimary,
  },
  textSelected: {
    color: appTheme.colors.surface,
  },
});

export default CategoryChip;
