import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { ACCENT } from '../theme/colors';
import type { ThemeMode } from '../types';

export function SettingsScreen() {
  const { colors, settings, identity, setTheme, setInternetMode, setFlag, rename, urgentWipe } = useApp();
  const [name, setName] = useState(identity?.pseudonym ?? '');
  const themes: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: 'Clair' },
    { key: 'dark', label: 'Sombre' },
    { key: 'oled', label: 'OLED' },
  ];

  const onWipe = () => {
    Alert.alert('Effacement d\'urgence', 'Supprime messages, discussions et identite locale. Irreversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Effacer tout', style: 'destructive', onPress: () => urgentWipe() },
    ]);
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { backgroundColor: colors.glass }]}>
        <Text style={[styles.title, { color: colors.text }]}>Reglages</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.textSecondary }]}>Identite locale</Text>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>{identity?.pseudonym ?? '-'}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4, fontSize: 12 }}>Empreinte {identity?.fingerprint ?? '-'}</Text>
        <TextInput value={name} onChangeText={setName} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]} placeholder="Nouveau pseudonyme" placeholderTextColor={colors.textSecondary} />
        <Pressable onPress={() => rename(name)} style={[styles.btn, { backgroundColor: ACCENT }]}>
          <Text style={styles.btnText}>Enregistrer le nom</Text>
        </Pressable>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.textSecondary }]}>Theme</Text>
        <View style={styles.rowWrap}>
          {themes.map((t) => (
            <Pressable key={t.key} onPress={() => setTheme(t.key)} style={[styles.chip, { backgroundColor: settings.theme === t.key ? ACCENT : colors.surfaceAlt, borderColor: colors.border }]}>
              <Text style={{ color: settings.theme === t.key ? '#fff' : colors.text, fontWeight: '600' }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Mode internet hybride</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Optionnel. La proximite reste prioritaire.</Text>
          </View>
          <Switch value={settings.internetMode} onValueChange={setInternetMode} trackColor={{ true: ACCENT, false: colors.border }} />
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.textSecondary }]}>Laboratoire</Text>
        {([
          ['lab_radar_discovery', 'Radar de proximite'],
          ['lab_favorites_alert', 'Alertes favoris'],
          ['lab_mesh_relay', 'Relais maillage'],
          ['lab_rooms', 'Salles protegees'],
          ['lab_urgent_wipe', 'Effacement d\'urgence'],
          ['lab_ephemeral_identity', 'Identite ephemere'],
        ] as const).map(([key, label]) => (
          <View key={key} style={styles.switchRow}>
            <Text style={{ color: colors.text, flex: 1 }}>{label}</Text>
            <Switch value={settings.flags[key]} onValueChange={(v) => setFlag(key, v)} trackColor={{ true: ACCENT, false: colors.border }} />
          </View>
        ))}
      </View>
      {settings.flags.lab_urgent_wipe && (
        <Pressable onPress={onWipe} style={[styles.danger, { borderColor: colors.danger }]}>
          <Text style={{ color: colors.danger, fontWeight: '700', textAlign: 'center' }}>Zone de danger — Effacer toutes les donnees locales</Text>
        </Pressable>
      )}
      <Text style={[styles.footer, { color: colors.textSecondary }]}>UpChat RN · offline-first · aucun compte requis</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '800' },
  card: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  section: { fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  input: { marginTop: 12, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { marginTop: 12, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  rowWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  danger: { marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 12, lineHeight: 18, paddingHorizontal: 24 },
});
