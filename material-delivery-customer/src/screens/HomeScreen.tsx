import React, {useEffect, useMemo, useState} from 'react';
import LocationSetupModal from '../components/location/LocationSetupModal';
import { useUserProfile } from '../context/UserProfileContext';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {IconButton, TextInput, useTheme} from 'react-native-paper';

import {
  fetchCategories,
  fetchProducts,
  type ApiCategory,
  type ApiProduct,
  type ApiUnit,
  type PaginatedProductsResponse,
} from '../api/catalog';
import {useLocation} from '../context/LocationContext';
import {HomeStackParamList} from '../navigation/HomeNavigator';
import {MaterialCard} from '../components/material/MaterialCard';

const UNIT_LABELS: Record<ApiUnit, string> = {
  TON: 'ton',
  M3: 'm3',
  BAG: 'bag',
  PIECE: 'piece',
};

const CATEGORY_ICONS: Record<string, string> = {
  sand: 'shovel',
  cement: 'sack',
  brick: 'cube-outline',
  steel: 'factory',
  gravel: 'dots-grid',
};

export function HomeScreen() {
  const { addresses, loadingAddresses, refreshAddresses } = useUserProfile();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const {
    currentCity,
    cityIds,
    autoDetectCity,
    autoDetecting,
    autoDetectError,
  } = useLocation();
  const theme = useTheme();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [productsNearYou, setProductsNearYou] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

    const [locationModalVisible, setLocationModalVisible] = useState(false);

  const cityId = useMemo(() => cityIds[currentCity], [cityIds, currentCity]);

  useEffect(() => {
    let isMounted = true;

      if (!loadingAddresses && addresses.length === 0) {
        setLocationModalVisible(true);
      }

    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const emptyProducts: PaginatedProductsResponse = {
          items: [],
          page: 1,
          pageSize: 10,
          total: 0,
        };

        const [cats, productsResponse] = await Promise.all([
          fetchCategories(),
          cityId
            ? fetchProducts({cityId, pageSize: 10})
            : Promise.resolve(emptyProducts),
        ]);

        if (!isMounted) return;
        setCategories(cats);
        setProductsNearYou(productsResponse.items);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load catalog');
        setProductsNearYou([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [cityId]);

  const renderCategory = ({item}: {item: ApiCategory}) => {
    const iconName = CATEGORY_ICONS[item.slug] ?? 'shape';
    return (
      <Pressable
        onPress={() =>
          navigation.navigate('ProductList', {
            categorySlug: item.slug,
            categoryName: item.name,
          })
        }
        style={styles.categoryChip}>
        <IconButton
          icon={iconName}
          size={18}
          style={styles.categoryIcon}
          iconColor={theme.colors.primary}
        />
        <Text style={styles.categoryLabel}>{item.name}</Text>
      </Pressable>
    );
  };

  const renderProduct = ({item}: {item: ApiProduct}) => (
    <MaterialCard
      product={item}
      onPress={() =>
        navigation.navigate('ProductDetails', {productId: item.id})
      }
    />
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F8FAFC'}}>
        <LocationSetupModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          onSiteCreated={async () => {
            await refreshAddresses();
            setLocationModalVisible(false);
          }}
        />
      <ScrollView contentContainerStyle={{paddingBottom: 32}}>
        <View style={[styles.hero, {backgroundColor: theme.colors.primary}]}> 
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroEyebrow}>Delivering to</Text>
              <View style={styles.cityRow}>
                <Text style={styles.heroTitle}>{currentCity}</Text>
                {!cityId ? (
                  <Text style={styles.subtleText}> (selecting city...)</Text>
                ) : null}
              </View>
              {autoDetectError ? (
                <Text style={styles.heroError}>{autoDetectError}</Text>
              ) : null}
            </View>
            <IconButton
              icon="crosshairs-gps"
              size={22}
              onPress={autoDetectCity}
              disabled={autoDetecting}
              containerColor="rgba(255,255,255,0.15)"
              iconColor="#FFFFFF"
              style={styles.locationButton}
            />
          </View>
          <TextInput
            mode="outlined"
            placeholder="Search sand, cement, steel..."
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
            outlineColor="rgba(255,255,255,0.35)"
            activeOutlineColor="#FFFFFF"
            textColor="#FFFFFF"
            placeholderTextColor="rgba(255,255,255,0.85)"
            selectionColor="#FFFFFF"
            onFocus={() => navigation.navigate('ProductList', {})}
            editable={!loading}
          />
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>{autoDetecting ? 'Detecting location...' : 'Fresh stock, fast delivery'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{productsNearYou.length}+ items</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by category</Text>
            <Pressable onPress={() => navigation.navigate('CategoryList')}>
              <Text style={[styles.link, {color: theme.colors.primary}]}>See all</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={item => item.id.toString()}
            renderItem={renderCategory}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 20}}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Materials near you</Text>
            <Pressable
              onPress={() => navigation.navigate('ProductList', {})}
            >
              <Text
                style={[
                  styles.link,
                  {color: theme.colors.primary},
                ]}>
                View all
              </Text>
            </Pressable>
          </View>
          {loading && (
            <View style={{paddingVertical: 12}}>
              <ActivityIndicator />
            </View>
          )}
          {error && !loading && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {!loading && productsNearYou.length === 0 && !error && (
            <Text style={styles.subtleText}>No materials found for this city.</Text>
          )}
          <FlatList
            horizontal
            data={productsNearYou}
            keyExtractor={item => item.id}
            renderItem={renderProduct}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 20}}
            ItemSeparatorComponent={() => <View style={{width: 12}} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  subtleText: {
    color: '#94A3B8',
  },
  heroError: {
    color: '#FCA5A5',
    marginTop: 4,
  },
  locationButton: {
    margin: 0,
  },
  searchInput: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  link: {
    fontWeight: '600',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  categoryIcon: {
    margin: 0,
    marginRight: 6,
    backgroundColor: 'rgba(37,99,235,0.06)',
  },
  categoryLabel: {
    fontWeight: '600',
    color: '#0F172A',
  },
  errorText: {
    color: '#DC2626',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
});
