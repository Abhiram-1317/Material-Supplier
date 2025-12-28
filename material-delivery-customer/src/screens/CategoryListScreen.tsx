import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Pressable, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {fetchCategories, type ApiCategory} from '../api/catalog';
import {HomeStackParamList} from '../navigation/HomeNavigator';

export function CategoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const result = await fetchCategories();
        if (!isMounted) return;
        setCategories(result);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load categories');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderItem = ({item}: {item: ApiCategory}) => (
    <Pressable
      onPress={() =>
        navigation.navigate('ProductList', {
          categorySlug: item.slug,
          categoryName: item.name,
        })
      }
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        margin: 8,
      }}>
      <Text style={{fontSize: 16, fontWeight: '700'}}>{item.name}</Text>
      {item.description ? (
        <Text style={{color: '#6B7280', marginTop: 4}} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{padding: 24, flex: 1}}>
        <View style={{marginBottom: 12}}>
          <Text style={{fontSize: 22, fontWeight: '700'}}>Categories</Text>
          <Text style={{color: '#6B7280'}}>Choose a category to browse materials.</Text>
        </View>
        {loading && (
          <View style={{paddingVertical: 12}}>
            <ActivityIndicator />
          </View>
        )}
        {error && !loading && (
          <Text style={{color: '#DC2626', marginBottom: 8}}>{error}</Text>
        )}
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{paddingHorizontal: 0}}
        />
      </View>
    </SafeAreaView>
  );
}
