import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import {HomeStackParamList} from '../../navigation/AppTabsNavigator';
import {MATERIALS, SUPPLIERS} from '../../data/mockMaterials';
import MaterialCard from '../../components/material/MaterialCard';
import {appTheme} from '../../theme/theme';
import {useLocation} from '../../context/LocationContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProductList'>;

const ProductListScreen: React.FC<Props> = ({route, navigation}) => {
  const {categoryId, categoryName, supplierId, showPopular} = route.params || {};
  const {currentCity} = useLocation();

  const filteredProducts = useMemo(() => {
    let items = MATERIALS;
    if (categoryId) items = items.filter(m => m.categoryId === categoryId);
    if (supplierId) items = items.filter(m => m.supplierId === supplierId);
    if (showPopular) items = items.filter(m => m.isPopular);
    // Restrict to materials whose supplier serves the current city
    const allowedSupplierIds = new Set(
      SUPPLIERS.filter(s => s.city === currentCity).map(s => s.id),
    );
    return items.filter(m => allowedSupplierIds.has(m.supplierId));
  }, [categoryId, supplierId, showPopular, currentCity]);

  const headerTitle = useMemo(() => {
    if (categoryName) return categoryName;
    if (showPopular) return 'Popular materials';
    if (supplierId) {
      const supplier = SUPPLIERS.find(s => s.id === supplierId);
      return supplier ? `Materials from ${supplier.name}` : 'Materials';
    }
    return 'Materials';
  }, [categoryName, showPopular, supplierId]);

  const renderItem = ({item}: {item: typeof MATERIALS[number]}) => {
    const supplier = SUPPLIERS.find(s => s.id === item.supplierId);
    if (!supplier) return null;
    return (
      <MaterialCard
        product={item}
        supplier={supplier}
        fullWidth
        onPress={() => navigation.navigate('ProductDetails', {productId: item.id})}
      />
    );
  };

  return (
    <ScreenContainer headerTitle={headerTitle}>
      <View style={styles.filtersRow}>
        <AppText variant="caption" color={appTheme.colors.textSecondary}>
          Sort by price • Fastest delivery (UI only)
        </AppText>
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: appTheme.spacing.md}} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.empty}>
            No materials found for this selection. Try changing filters or category.
          </AppText>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  filtersRow: {
    marginBottom: appTheme.spacing.md,
  },
  list: {
    paddingBottom: appTheme.spacing.xxl,
  },
  empty: {
    textAlign: 'center',
    marginTop: appTheme.spacing.xl,
  },
});

export default ProductListScreen;
