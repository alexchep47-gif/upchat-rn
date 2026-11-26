import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AppSettings,
  Conversation,
  Identity,
  Message,
  Peer,
  ThemeMode,
} from '../types';
import {
  appendMessage,
  buildEchoReply,
  buildOutgoing,
  demoPeers,
  loadConversations,
  loadMessages,
  loadPeers,
  persistConversations,
  persistMessages,
  persistPeers,
  upsertConversation,
  wipeAllChatData,
} from '../services/chatStore';
import {
  createIdentity,
  loadIdentity,
  updatePseudonym,
  wipeIdentity,
} from '../services/identity';
import { defaultSettings, loadSettings, saveSettings } from '../services/settings';
import { palettes, type Palette } from '../theme/colors';

type AppContextValue = {
  ready: boolean;
  identity: Identity | null;
  settings: AppSettings;
  colors: Palette;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  peers: Peer[];
  bootstrap: () => Promise<void>;
  completeOnboarding: (pseudonym: string) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setInternetMode: (v: boolean) => Promise<void>;
  setFlag: (key: keyof AppSettings['flags'], value: boolean) => Promise<void>;
  rename: (pseudonym: string) => Promise<void>;
  openChatWithPeer: (peer: Peer) => Promise<Conversation>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  refreshRadar: () => Promise<void>;
  toggleFavorite: (peerId: string) => Promise<void>;
  urgentWipe: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [peers, setPeers] = useState<Peer[]>([]);

  const colors = palettes[settings.theme];

  const bootstrap = useCallback(async () => {
    const [id, s, conv, msg, p] = await Promise.all([
      loadIdentity(),
      loadSettings(),
      loadConversations(),
      loadMessages(),
      loadPeers(),
    ]);
    setIdentity(id);
    setSettings(s);
    setConversations(conv);
    setMessages(msg);
    setPeers(p.length ? p : demoPeers());
    setReady(true);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const persistSettings = async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
  };

  const completeOnboarding = async (pseudonym: string) => {
    const id = await createIdentity(pseudonym);
    setIdentity(id);
    const next = { ...settings, onboardingDone: true };
    await persistSettings(next);
  };

  const setTheme = async (theme: ThemeMode) => {
    await persistSettings({ ...settings, theme });
  };

  const setInternetMode = async (internetMode: boolean) => {
    await persistSettings({ ...settings, internetMode });
  };

  const setFlag = async (key: keyof AppSettings['flags'], value: boolean) => {
    await persistSettings({
      ...settings,
      flags: { ...settings.flags, [key]: value },
    });
  };

  const rename = async (pseudonym: string) => {
    if (!identity) return;
    const next = await updatePseudonym(identity, pseudonym);
    setIdentity(next);
  };

  const openChatWithPeer = async (peer: Peer) => {
    if (!identity) throw new Error('Pas d\'identité');
    const { list, conversation } = upsertConversation(
      conversations,
      peer.id,
      peer.name,
      identity.id,
    );
    setConversations(list);
    await persistConversations(list);
    const peerList = peers.some((p) => p.id === peer.id) ? peers : [peer, ...peers];
    setPeers(peerList);
    await persistPeers(peerList);
    return conversation;
  };

  const sendMessage = async (conversationId: string, text: string) => {
    if (!identity || !text.trim()) return;
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const transport = settings.internetMode ? 'internet' : 'nearby';
    const outgoing = buildOutgoing({
      conversationId,
      senderId: identity.id,
      senderName: identity.pseudonym,
      content: text,
      transport,
    });

    let nextMessages = appendMessage(messages, outgoing);
    setMessages(nextMessages);

    const nextConv = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: outgoing.content, lastAt: outgoing.createdAt }
        : c,
    );
    setConversations(nextConv);
    await persistConversations(nextConv);

    outgoing.status = 'sent';
    nextMessages = {
      ...nextMessages,
      [conversationId]: (nextMessages[conversationId] ?? []).map((m) =>
        m.id === outgoing.id ? { ...m, status: 'sent' as const } : m,
      ),
    };
    setMessages(nextMessages);

    const reply = buildEchoReply(outgoing, conv.peerName);
    nextMessages = appendMessage(nextMessages, reply);
    setMessages(nextMessages);
    await persistMessages(nextMessages);

    const withReply = nextConv.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: reply.content, lastAt: reply.createdAt }
        : c,
    );
    setConversations(withReply);
    await persistConversations(withReply);
  };

  const refreshRadar = async () => {
    const fresh = demoPeers().map((p) => {
      const prev = peers.find((x) => x.id === p.id);
      return { ...p, isFavorite: prev?.isFavorite };
    });
    setPeers(fresh);
    await persistPeers(fresh);
  };

  const toggleFavorite = async (peerId: string) => {
    const next = peers.map((p) =>
      p.id === peerId ? { ...p, isFavorite: !p.isFavorite } : p,
    );
    setPeers(next);
    await persistPeers(next);
  };

  const urgentWipe = async () => {
    await wipeAllChatData();
    await wipeIdentity();
    setConversations([]);
    setMessages({});
    setPeers(demoPeers());
    setIdentity(null);
    await persistSettings({ ...defaultSettings, theme: settings.theme });
  };

  const value = useMemo(
    () => ({
      ready,
      identity,
      settings,
      colors,
      conversations,
      messages,
      peers,
      bootstrap,
      completeOnboarding,
      setTheme,
      setInternetMode,
      setFlag,
      rename,
      openChatWithPeer,
      sendMessage,
      refreshRadar,
      toggleFavorite,
      urgentWipe,
    }),
    [ready, identity, settings, colors, conversations, messages, peers, bootstrap],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp hors AppProvider');
  return ctx;
}
