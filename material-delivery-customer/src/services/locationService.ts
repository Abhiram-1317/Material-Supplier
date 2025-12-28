import * as Location from 'expo-location';

export type DetectedCityName = 'Warangal' | 'Hanumakonda' | null;

export interface DetectedLocationResult {
  city: DetectedCityName;
  latitude: number;
  longitude: number;
  addressLine?: string;
  pincode?: string;
  error?: string;
}

export async function requestAndDetectCity(): Promise<DetectedLocationResult> {
  try {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {city: null, latitude: 0, longitude: 0, error: 'Permission not granted'};
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const {latitude, longitude} = pos.coords;

    const places = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const place = places[0];
    const nameParts = [
      place?.city,
      place?.subregion,
      place?.region,
      place?.district,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    let detected: DetectedCityName = null;
    if (nameParts.includes('warangal')) detected = 'Warangal';
    if (nameParts.includes('hanumakonda') || nameParts.includes('hanamkonda'))
      detected = 'Hanumakonda';

    const addressLine = [place?.name, place?.street, place?.district, place?.subregion]
      .filter(Boolean)
      .join(', ');

    return {
      city: detected,
      latitude,
      longitude,
      addressLine: addressLine || undefined,
      pincode: place?.postalCode ?? undefined,
    };
  } catch (e: any) {
    return {
      city: null,
      latitude: 0,
      longitude: 0,
      error: e?.message || 'Failed to detect location',
    };
  }
}
