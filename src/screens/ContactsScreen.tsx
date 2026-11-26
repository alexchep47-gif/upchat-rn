import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../store/AppContext';
import { ACCENT } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

export function ContactsScreen() {
  const { colors, peers, openChatWithPeer } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const favorites = peers.filter((p) => p.isFavorite);
  const others = peers.filter((p) => !p.isFavorite);

  const open = async (id: string) => {
    const peer = peers.find((p) => p.id === id);
    if (!peer) return;
    const conv = await openChatWithPeer(peer);
    navigation.navigate('Chat', {
      conversationId: conv.id,
      peerName: conv.peerName,
      peerId: conv.peerId,
    });
  };

  const sections = [
    ...(favorites.length ? [{ title: 'Favoris', data: favorites }] : []),
    { title: 'Contacts découverts', data: others },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.glass }]}>
        <Text style={[styles.title, { color: colors.text }]}>Contacts</Text>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(s) => s.title}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item: section }) => (
          <View>
            <Text style={[styles.section, { color: colors.textSecondary }]}>{section.title}</Text>
            {section.data.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => open(p.id)}
                style={[styles.row, { borderBottomColor: colors.border }]}
              >
                <View style={[styles.avatar, { backgroundColor: ACCENT }]}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{p.name.slice(0, 1)}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{p.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {p.signal ?? '—'} · {p.isSimulated ? 'démo' : 'pair'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '800' },
  section: {
    marginTop: 16, marginHorizontal: 16, marginBottom: 6,
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
});
