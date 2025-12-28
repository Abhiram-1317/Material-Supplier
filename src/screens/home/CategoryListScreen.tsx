import React from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import {appTheme} from '../../theme/theme';
import {CATEGORIES} from '../../data/mockMaterials';
import {HomeStackParamList} from '../../navigation/AppTabsNavigator';

const CategoryListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  return (
    <ScreenContainer headerTitle="All categories">
      <FlatList
        data={CATEGORIES}
        numColumns={2}
        columnWrapperStyle={styles.column}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <Pressable
            style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('ProductList', {categoryId: item.id, categoryName: item.name})}
          >
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={appTheme.colors.primary} />
            </View>
            <AppText variant="subtitle" style={styles.title}>
              {item.name}
            </AppText>
            {item.description ? (
              <AppText variant="body" color={appTheme.colors.textSecondary}>
                {item.description}
              </AppText>
            ) : null}
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: appTheme.spacing.xxl,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: appTheme.spacing.md,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    width: '48%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: appTheme.elevations.card,
  },
  cardPressed: {
    opacity: 0.95,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: appTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appTheme.spacing.sm,
  },
  title: {
    marginBottom: appTheme.spacing.xs,
  },
});

export default CategoryListScreen;
