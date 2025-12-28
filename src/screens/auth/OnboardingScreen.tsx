import React, {useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {appTheme} from '../../theme/theme';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

export type OnboardingScreenProps = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

type Slide = {
  key: string;
  title: string;
  description: string;
  color: string;
  icon: string;
};

const slides: Slide[] = [
  {
    key: 'materials',
    title: 'Order construction materials in minutes',
    description: 'Sand, cement, RMC, bricks, precast walls — delivered to site with reliable ETAs.',
    color: '#E3F2FD',
    icon: 'truck-fast',
  },
  {
    key: 'fleet',
    title: 'Reliable factory delivery vehicles',
    description: 'Only factory-owned trucks, vetted drivers, and transparent pricing. No random vehicles.',
    color: '#FFF3E0',
    icon: 'warehouse',
  },
  {
    key: 'tracking',
    title: 'Track your site deliveries in real time',
    description: 'Live location, delivery slots, and status updates so your crew never waits idle.',
    color: '#E8F5E9',
    icon: 'clock-check-outline',
  },
];

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({navigation}) => {
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    const next = index + 1;
    if (next < slides.length) {
      listRef.current?.scrollToIndex({index: next, animated: true});
      setIndex(next);
    } else {
      navigation.replace('Login');
    }
  };

  const onSkip = () => {
    navigation.replace('Login');
  };

  const renderItem: ListRenderItem<Slide> = ({item}) => (
    <View style={[styles.slide, {width: SCREEN_WIDTH}]}> 
      <View style={[styles.illustration, {backgroundColor: item.color}]}> 
        <AppText variant="title2" style={styles.icon}>{item.icon}</AppText>
      </View>
      <AppText variant="title1" style={styles.title}>
        {item.title}
      </AppText>
      <AppText variant="body" style={styles.subtitle} color={appTheme.colors.textSecondary}>
        {item.description}
      </AppText>
    </View>
  );

  const keyExtractor = useMemo(() => (item: Slide) => item.key, []);

  const onViewableItemsChanged = useRef(({viewableItems}: {viewableItems: any[]}) => {
    if (viewableItems && viewableItems.length > 0) {
      const nextIndex = viewableItems[0].index ?? 0;
      if (typeof nextIndex === 'number') {
        setIndex(nextIndex);
      }
    }
  }).current;

  const viewabilityConfig = useMemo(
    () => ({viewAreaCoveragePercentThreshold: 60}),
    [],
  );

  const isLast = index === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <AppText variant="body" color={appTheme.colors.primary}>Skip</AppText>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={_.key}
                style={[
                  styles.dot,
                  {backgroundColor: active ? appTheme.colors.primary : '#D1D5DB'},
                ]}
              />
            );
          })}
        </View>
        <AppButton onPress={handleNext} style={styles.cta}>
          {isLast ? 'Get Started' : 'Next'}
        </AppButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: appTheme.spacing.md,
  },
  slide: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.xl,
    paddingBottom: appTheme.spacing.xxl,
  },
  illustration: {
    height: 220,
    borderRadius: appTheme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appTheme.spacing.xl,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    marginBottom: appTheme.spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xl,
    paddingTop: appTheme.spacing.lg,
    alignItems: 'flex-end',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: appTheme.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: appTheme.spacing.sm,
  },
  cta: {
    alignSelf: 'flex-end',
    minWidth: 140,
  },
});

export default OnboardingScreen;
