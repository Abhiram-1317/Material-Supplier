import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, FlatList, RefreshControl, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator, Badge, List, useTheme} from 'react-native-paper';

import {
  fetchNotifications,
  markNotificationRead,
  type ApiNotification,
} from '../api/notifications';

function formatDate(iso?: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

export function NotificationsScreen() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setError(null);
    const data = await fetchNotifications();
    setNotifications(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        await loadNotifications();
      } catch (err) {
        if (mounted) setError('Unable to load notifications');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [loadNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } catch (err) {
      setError('Unable to load notifications');
    } finally {
      setRefreshing(false);
    }
  }, [loadNotifications]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      if (markingId) return;
      setMarkingId(id);
      try {
        const updated = await markNotificationRead(id);
        setNotifications(prev =>
          prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  status: 'READ',
                  readAt: updated?.readAt ?? new Date().toISOString(),
                }
              : item,
          ),
        );
      } catch (err) {
        setError('Unable to mark notification as read');
      } finally {
        setMarkingId(null);
      }
    },
    [markingId],
  );

  const renderItem = useCallback(
    ({item}: {item: ApiNotification}) => {
      const isRead = item.status === 'READ';
      return (
        <Pressable onPress={() => (!isRead ? handleMarkRead(item.id) : undefined)}>
          <List.Item
            title={item.title}
            description={() => (
              <View style={{gap: 4}}>
                <Text style={{color: '#374151'}}>{item.body}</Text>
                <Text style={{color: '#6B7280', fontSize: 12}}>{formatDate(item.createdAt)}</Text>
              </View>
            )}
            left={props => (
              <List.Icon
                {...props}
                icon={isRead ? 'bell-outline' : 'bell'}
                color={isRead ? theme.colors.onSurfaceDisabled : theme.colors.primary}
              />
            )}
            right={() => (
              <View style={{alignItems: 'flex-end', justifyContent: 'center', minWidth: 72}}>
                {!isRead ? (
                  <Badge style={{backgroundColor: theme.colors.primary, color: theme.colors.onPrimary}}>
                    New
                  </Badge>
                ) : (
                  <Text style={{color: '#6B7280', fontSize: 12}}>Read</Text>
                )}
                {markingId === item.id ? <ActivityIndicator size="small" /> : null}
              </View>
            )}
            style={{backgroundColor: '#FFFFFF', marginBottom: 8}}
          />
        </Pressable>
      );
    },
    [handleMarkRead, markingId, theme.colors.onPrimary, theme.colors.onSurfaceDisabled, theme.colors.primary],
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{flex: 1, padding: 24}}>
        <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 8}}>Notifications</Text>
        <Text style={{color: '#4B5563', marginBottom: 16}}>
          Order updates and alerts will appear here.
        </Text>
        {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <Text style={{color: theme.colors.error, marginBottom: 8}}>{error}</Text>
        ) : notifications.length === 0 ? (
          <Text style={{color: '#6B7280'}}>You have no notifications yet.</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{paddingBottom: 24}}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
