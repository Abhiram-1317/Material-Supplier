import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type RatingStarsProps = {
  rating: number;
  max?: number;
  editable?: boolean;
  size?: number;
  onChange?: (value: number) => void;
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  editable = true,
  size = 24,
  onChange,
}) => {
  const theme = useTheme();
  const stars = [];

  for (let i = 1; i <= max; i++) {
    const filled = i <= rating;
    const color = filled ? theme.colors.primary : theme.colors.backdrop ?? '#D1D5DB';

    stars.push(
      <TouchableOpacity
        key={i}
        disabled={!editable}
        onPress={() => editable && onChange?.(i)}
        style={styles.starButton}
        accessibilityRole={editable ? 'button' : undefined}
        accessibilityLabel={`${i} star${i === 1 ? '' : 's'}`}
      >
        <Icon name={filled ? 'star' : 'star-outline'} size={size} color={color} />
      </TouchableOpacity>,
    );
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginHorizontal: 2,
  },
});

export default RatingStars;
