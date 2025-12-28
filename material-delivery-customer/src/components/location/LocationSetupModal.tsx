import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Modal,
  Portal,
  Button,
  Text,
  TextInput,
  ActivityIndicator,
  Surface,
  IconButton,
} from 'react-native-paper';
import {createCustomerSite, type CreateSitePayload} from '../../api/customer';
import {requestAndDetectCity, type DetectedLocationResult} from '../../services/locationService';
import {useLocation} from '../../context/LocationContext';

const CITY_OPTIONS = [
  { label: 'Warangal', value: 'Warangal' },
  { label: 'Hanumakonda', value: 'Hanumakonda' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSiteCreated?: (site: any) => void;
};

export default function LocationSetupModal({visible, onClose, onSiteCreated}: Props) {
  const {cityIds} = useLocation();
  const [view, setView] = useState<'select' | 'manual' | 'loading'>('select');
  const [form, setForm] = useState({
    label: '',
    city: CITY_OPTIONS[0].value,
    addressLine: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = async () => {
    setView('loading');
    setError('');
    try {
      const loc: DetectedLocationResult = await requestAndDetectCity();
      if (!loc || !loc.city || !loc.latitude || !loc.longitude) {
        throw new Error('Could not detect location');
      }
      const city = CITY_OPTIONS.find((c) => loc.city && loc.city.toLowerCase().includes(c.value.toLowerCase()));
      if (!city) throw new Error('Service available only in Warangal/Hanumakonda');
      const cityId = cityIds[city.value as keyof typeof cityIds];
      if (!cityId) throw new Error('Selected city is not available');

      const payload: CreateSitePayload = {
        label: 'My Location',
        cityId,
        addressLine: loc.addressLine || '',
        pincode: loc.pincode || '',
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
      const site = await createCustomerSite(payload);
      onSiteCreated?.(site);
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to detect location';
      setError(message);
      setView('select');
    }
  };

  const handleManualSave = async () => {
    setLoading(true);
    setError('');
    try {
      if (!form.label.trim() || !form.city || !form.addressLine.trim() || !form.pincode.trim()) {
        setError('All fields are required');
        setLoading(false);
        return;
      }
      const cityId = cityIds[form.city as keyof typeof cityIds];
      if (!cityId) throw new Error('Selected city is not available');

      const site = await createCustomerSite({
        label: form.label.trim(),
        cityId,
        addressLine: form.addressLine.trim(),
        pincode: form.pincode.trim(),
      });
      onSiteCreated?.(site);
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save address';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface}>
          {view === 'select' && (
            <>
              <Text style={styles.title}>Set up your delivery address</Text>
              <Button
                mode="contained"
                icon="crosshairs-gps"
                style={styles.bigButton}
                onPress={handleUseCurrentLocation}
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                📍 Use Current Location
              </Button>
              <Button
                mode="outlined"
                icon="pencil"
                style={styles.bigButton}
                onPress={() => setView('manual')}
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                ✍️ Enter Manually
              </Button>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          )}
          {view === 'loading' && (
            <View style={{ alignItems: 'center', padding: 32 }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 16 }}>Detecting your location…</Text>
            </View>
          )}
          {view === 'manual' && (
            <View>
              <Text style={styles.title}>Enter Address</Text>
              <TextInput
                label="Label (e.g. Home, Office)"
                value={form.label}
                onChangeText={label => setForm(f => ({ ...f, label }))}
                style={styles.input}
              />
              <TextInput
                label="Address Line"
                value={form.addressLine}
                onChangeText={addressLine => setForm(f => ({ ...f, addressLine }))}
                style={styles.input}
              />
              <TextInput
                label="Pincode"
                value={form.pincode}
                onChangeText={pincode => setForm(f => ({ ...f, pincode }))}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={{ marginTop: 8, marginBottom: 4, fontWeight: 'bold' }}>City</Text>
              <View style={styles.cityRow}>
                {CITY_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    mode={form.city === opt.value ? 'contained' : 'outlined'}
                    onPress={() => setForm(f => ({ ...f, city: opt.value }))}
                    style={styles.cityButton}
                  >
                    {opt.label}
                  </Button>
                ))}
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                mode="contained"
                onPress={handleManualSave}
                loading={loading}
                style={{ marginTop: 16, borderRadius: 8 }}
              >
                Save Address
              </Button>
              <IconButton icon="arrow-left" onPress={() => setView('select')} style={{ marginTop: 8 }} />
            </View>
          )}
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  surface: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#fff',
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  bigButton: {
    marginVertical: 8,
    borderRadius: 8,
    paddingVertical: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  error: {
    color: '#d32f2f',
    marginTop: 8,
    textAlign: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cityButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
});
