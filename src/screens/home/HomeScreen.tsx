import React, {useMemo, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {TextInput as PaperTextInput, Modal, Portal, RadioButton} from 'react-native-paper';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';
import {appTheme} from '../../theme/theme';
import {HomeStackParamList} from '../../navigation/AppTabsNavigator';
import {useNavigation} from '@react-navigation/native';
import {CATEGORIES, MATERIALS, SUPPLIERS} from '../../data/mockMaterials';
import CategoryChip from '../../components/material/CategoryChip';
import MaterialCard from '../../components/material/MaterialCard';
import SectionHeader from '../../components/layout/SectionHeader';
import {useLocation} from '../../context/LocationContext';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const {currentCity, setCity, SERVICE_CITIES} = useLocation();
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const popularProducts = useMemo(() => {
    const supplierMap = Object.fromEntries(SUPPLIERS.map(s => [s.id, s]));
    return MATERIALS.filter(m => m.isPopular && supplierMap[m.supplierId]?.city === currentCity);
  }, [currentCity]);

  const citySuppliers = useMemo(
    () => SUPPLIERS.filter(s => s.city === currentCity),
    [currentCity],
  );

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    navigation.navigate('ProductList', {categoryId, categoryName});
  };

  const handlePopularViewAll = () => {
    navigation.navigate('ProductList', {showPopular: true});
  };

  const handleSearchPress = () => {
    Alert.alert('Search', 'Search flow coming soon.');
  };

  const renderPopular = () => {
    if (!popularProducts.length) {
      return (
        <AppText variant="body" color={appTheme.colors.textSecondary}>
          No popular materials yet. Try a category.
        </AppText>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {popularProducts.map(product => {
          const supplier = SUPPLIERS.find(s => s.id === product.supplierId);
          if (!supplier) return null;
          return (
            <MaterialCard
              key={product.id}
              product={product}
              supplier={supplier}
              onPress={() => navigation.navigate('ProductDetails', {productId: product.id})}
            />
          );
        })}
      </ScrollView>
    );
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.topRow}>
        <View style={styles.locationText}>
          <AppText variant="caption" color={appTheme.colors.textSecondary}>
            Delivering to
          </AppText>
          <AppText variant="subtitle">{currentCity}</AppText>
        </View>
        <AppButton
          compact
          variant="secondary"
          onPress={() => setCityModalVisible(true)}
          style={styles.changeBtn}
        >
          Change
        </AppButton>
      </View>

      <AppTextInput
        placeholder="Search sand, cement, RMC, suppliers..."
        left={<PaperTextInput.Icon icon="magnify" />}
        onPressIn={handleSearchPress}
        editable={false}
        style={styles.search}
      />

      <SectionHeader
        title="Materials by category"
        actionLabel="View all"
        onActionPress={() => navigation.navigate('CategoryList')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map(category => (
          <CategoryChip
            key={category.id}
            category={category}
            selected={selectedCategoryId === category.id}
            onPress={() => handleCategoryPress(category.id, category.name)}
          />
        ))}
      </ScrollView>

      <SectionHeader
        title="Popular materials near you"
        actionLabel="View all"
        onActionPress={handlePopularViewAll}
      />
      {renderPopular()}

      <SectionHeader title="Top suppliers for your site" subtitle="Trusted and nearby" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {citySuppliers.map(supplier => (
          <View key={supplier.id} style={styles.supplierCard}>
            <AppText variant="subtitle">{supplier.name}</AppText>
            <AppText variant="body" color={appTheme.colors.textSecondary}>
              ★ {supplier.rating.toFixed(1)} ({supplier.totalRatings})
            </AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              {supplier.distanceKm.toFixed(1)} km away • {supplier.city}
            </AppText>
            <AppButton
              variant="secondary"
              style={styles.viewMaterials}
              onPress={() => navigation.navigate('ProductList', {supplierId: supplier.id})}
            >
              View materials
            </AppButton>
          </View>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={cityModalVisible}
          onDismiss={() => setCityModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <AppText variant="title2" style={styles.modalTitle}>Choose city</AppText>
          <RadioButton.Group
            onValueChange={value => {
              setCity(value as typeof currentCity);
              setCityModalVisible(false);
            }}
            value={currentCity}
          >
            {SERVICE_CITIES.map(city => (
              <View key={city} style={styles.modalRow}>
                <RadioButton value={city} />
                <AppText variant="body">{city}</AppText>
              </View>
            ))}
          </RadioButton.Group>
        </Modal>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: appTheme.spacing.md,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    marginBottom: appTheme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: appTheme.elevations.card,
  },
  locationText: {
    flex: 1,
  },
  changeBtn: {
    width: 96,
  },
  search: {
    marginTop: appTheme.spacing.md,
  },
  categoryRow: {
    paddingRight: appTheme.spacing.md,
  },
  horizontalList: {
    paddingRight: appTheme.spacing.md,
  },
  supplierCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    marginRight: appTheme.spacing.md,
    width: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: appTheme.elevations.card,
  },
  viewMaterials: {
    marginTop: appTheme.spacing.md,
  },
  modal: {
    backgroundColor: appTheme.colors.surface,
    marginHorizontal: appTheme.spacing.lg,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.lg,
  },
  modalTitle: {
    marginBottom: appTheme.spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
