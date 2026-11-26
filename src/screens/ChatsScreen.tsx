import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../store/AppContext';
import { ACCENT } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Filter = 'tous' | 'personnel' | 'proches';

export function ChatsScreen() {
  const { colors, conversations, settings, identity } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<Filter>('tous');

  const data = useMemo(() => {
    let list = [...conversations].sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''));
    if (filter === 'proches') list = list.filter((c) => c.peerId.startsWith('demo-'));
    return list;
  }, [conversations, filter]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.glass }]}>
        <Text style={[styles.title, { color: colors.text }]}>Echanges</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{identity?.pseudonym ?? '-'}</Text>
      </View>
      {settings.internetMode && (
        <View style={[styles.banner, { backgroundColor: ACCENT + '22' }]}>
          <Text style={{ color: ACCENT, fontWeight: '600', fontSize: 13 }}>Mode internet hybride active</Text>
        </View>
      )}
      <View style={styles.filters}>
        {(['tous', 'personnel', 'proches'] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, { backgroundColor: filter === f ? ACCENT : colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: filter === f ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
              {f === 'tous' ? 'Tous' : f === 'personnel' ? 'Personnel' : 'Proches'}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={data.length === 0 ? styles.emptyWrap : { paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune discussion</Text>
            <Text style={{ color: colors.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              Va dans Proximite pour decouvrir des appareils, ou ouvre un contact demo.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Chat', { conversationId: item.id, peerName: item.peerName, peerId: item.peerId })}
            style={[styles.row, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.avatar, { backgroundColor: ACCENT }]}>
              <Text style={styles.avatarText}>{item.peerName.slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.peerName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }} numberOfLines={1}>{item.lastMessage ?? 'Nouvelle discussion'}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 28, fontWeight: '800' },
  banner: { marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 12 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  emptyWrap: { flexGrow: 1, justifyContent: 'center' },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
});
