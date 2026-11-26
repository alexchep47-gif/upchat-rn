import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useApp } from '../store/AppContext';
import { ACCENT } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { conversationId, peerName } = route.params;
  const { colors, messages, sendMessage, identity } = useApp();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const list = useMemo(() => messages[conversationId] ?? [], [messages, conversationId]);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: peerName, headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text });
  }, [navigation, peerName, colors]);

  const onSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const payload = text;
    setText('');
    try {
      await sendMessage(conversationId, payload);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <FlatList
        ref={listRef}
        data={list}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={<Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Dis bonjour a {peerName}.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.isMe ? { alignSelf: 'flex-end', backgroundColor: colors.bubbleMe } : { alignSelf: 'flex-start', backgroundColor: colors.bubbleThem }]}>
            <Text style={{ color: item.isMe ? colors.bubbleMeText : colors.bubbleThemText, fontSize: 15, lineHeight: 21 }}>{item.content}</Text>
            <Text style={{ color: item.isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary, fontSize: 10, marginTop: 4, alignSelf: 'flex-end' }}>
              {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {item.isMe ? ` · ${item.status}` : ''}
            </Text>
          </View>
        )}
      />
      <View style={[styles.composer, { backgroundColor: colors.glass, borderTopColor: colors.border }]}>
        <TextInput value={text} onChangeText={setText} placeholder="Message" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} multiline maxLength={2000} />
        <Pressable onPress={onSend} disabled={!text.trim() || sending} style={[styles.send, { backgroundColor: ACCENT, opacity: !text.trim() ? 0.5 : 1 }]}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, minHeight: 42, maxHeight: 120, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16 },
  send: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
