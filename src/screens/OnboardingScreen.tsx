import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { suggestPseudonym } from '../services/identity';
import { useApp } from '../store/AppContext';
import { ACCENT } from '../theme/colors';

export function OnboardingScreen() {
  const { colors, completeOnboarding } = useApp();
  const initial = useMemo(() => suggestPseudonym(), []);
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);

  const onStart = async () => {
    setBusy(true);
    try {
      await completeOnboarding(name);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: ACCENT }]}>
          <Text style={styles.logoText}>U</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>UpChat</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Messagerie de proximité. Aucun compte, aucun numéro requis.\nLes messages restent sur ton appareil.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Ton pseudonyme</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex. Baobab214"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          autoCapitalize="none"
          maxLength={24}
        />
        <Pressable onPress={() => setName(suggestPseudonym())} style={styles.hintBtn}>
          <Text style={{ color: ACCENT, fontWeight: '600' }}>Proposer un autre nom</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onStart}
        disabled={busy || !name.trim()}
        style={[styles.cta, { backgroundColor: ACCENT, opacity: busy ? 0.7 : 1 }]}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>Commencer sans compte</Text>
        )}
      </Pressable>

      <Text style={[styles.foot, { color: colors.textSecondary }]}>
        Tu pourras changer d'identité plus tard. Les données restent locales.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  sub: { textAlign: 'center', marginTop: 10, lineHeight: 22, fontSize: 15, paddingHorizontal: 8 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
  hintBtn: { marginTop: 12, alignSelf: 'flex-start' },
  cta: { borderRadius: 28, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  foot: { textAlign: 'center', marginTop: 18, fontSize: 12, lineHeight: 18 },
});
