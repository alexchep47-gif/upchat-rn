import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../store/AppContext';
import { ACCENT } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

export function ProximityScreen() {
  const { colors, peers, settings, refreshRadar, openChatWithPeer, toggleFavorite } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scanning, setScanning] = React.useState(false);

  const onScan = async () => {
    setScanning(true);
    await refreshRadar();
    setTimeout(() => setScanning(false), 800);
  };

  const onOpen = async (peerId: string) => {
    const peer = peers.find((p) => p.id === peerId);
    if (!peer) return;
    const conv = await openChatWithPeer(peer);
    navigation.navigate('Chat', { conversationId: conv.id, peerName: conv.peerName, peerId: conv.peerId });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.glass }]}>
        <Text style={[styles.title, { color: colors.text }]}>Proximite</Text>
        <Pressable onPress={onScan} style={[styles.scanBtn, { backgroundColor: ACCENT }]}>
          {scanning ? <ActivityIndicator color="#fff" /> : <Text style={styles.scanText}>Radar</Text>}
        </Pressable>
      </View>
      <View style={[styles.radar, { borderColor: ACCENT + '55', backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.ring, { borderColor: ACCENT + '44' }]} />
        <View style={[styles.dot, { backgroundColor: ACCENT }]} />
        <Text style={[styles.radarLabel, { color: colors.textSecondary }]}>
          {settings.flags.lab_radar_discovery ? 'Decouverte locale (demo) — BLE natif a brancher plus tard' : 'Radar desactive dans Laboratoire'}
        </Text>
      </View>
      <Text style={[styles.section, { color: colors.textSecondary }]}>Appareils a portee ({peers.length})</Text>
      <FlatList
        data={settings.flags.lab_radar_discovery ? peers : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 24 }}>Active le radar dans Laboratoire.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable style={{ flex: 1 }} onPress={() => onOpen(item.id)}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Signal {item.signal ?? '-'} · {item.transport ?? 'nearby'}{item.isSimulated ? ' · demo' : ''}
              </Text>
            </Pressable>
            <Pressable onPress={() => toggleFavorite(item.id)} style={styles.star}>
              <Text style={{ fontSize: 20 }}>{item.isFavorite ? '★' : '☆'}</Text>
            </Pressable>
            <Pressable onPress={() => onOpen(item.id)} style={[styles.chatBtn, { backgroundColor: ACCENT }]}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Discuter</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 28, fontWeight: '800' },
  scanBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, minWidth: 80, alignItems: 'center' },
  scanText: { color: '#fff', fontWeight: '700' },
  radar: { margin: 16, height: 160, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 2 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  radarLabel: { position: 'absolute', bottom: 12, fontSize: 11, textAlign: 'center', paddingHorizontal: 16 },
  section: { marginHorizontal: 16, marginBottom: 8, fontSize: 13, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  name: { fontWeight: '700', fontSize: 16 },
  star: { padding: 6 },
  chatBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
});
