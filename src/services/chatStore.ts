import type { Conversation, Message, Peer } from '../types';
import { conversationIdFor, randomId } from '../utils/id';
import { KEYS, loadJson, removeKey, saveJson } from './storage';

export async function loadConversations(): Promise<Conversation[]> {
  return loadJson(KEYS.conversations, []);
}

export async function loadMessages(): Promise<Record<string, Message[]>> {
  return loadJson(KEYS.messages, {});
}

export async function loadPeers(): Promise<Peer[]> {
  return loadJson(KEYS.peers, []);
}

export async function persistConversations(list: Conversation[]) {
  await saveJson(KEYS.conversations, list);
}

export async function persistMessages(map: Record<string, Message[]>) {
  await saveJson(KEYS.messages, map);
}

export async function persistPeers(peers: Peer[]) {
  await saveJson(KEYS.peers, peers);
}

export function upsertConversation(
  list: Conversation[],
  peerId: string,
  peerName: string,
  myId: string,
): { list: Conversation[]; conversation: Conversation } {
  const id = conversationIdFor(myId, peerId);
  const existing = list.find((c) => c.id === id);
  if (existing) {
    return {
      list: list.map((c) =>
        c.id === id ? { ...c, peerName } : c,
      ),
      conversation: { ...existing, peerName },
    };
  }
  const conversation: Conversation = {
    id,
    peerId,
    peerName,
    unread: 0,
  };
  return { list: [conversation, ...list], conversation };
}

export function appendMessage(
  map: Record<string, Message[]>,
  message: Message,
): Record<string, Message[]> {
  const prev = map[message.conversationId] ?? [];
  return {
    ...map,
    [message.conversationId]: [...prev, message],
  };
}

export function buildOutgoing(params: {
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  transport?: Message['transport'];
}): Message {
  return {
    id: randomId(),
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderName: params.senderName,
    content: params.content.trim(),
    createdAt: new Date().toISOString(),
    status: 'sending',
    isMe: true,
    transport: params.transport ?? 'local',
  };
}

export function buildEchoReply(original: Message, peerName: string): Message {
  return {
    id: randomId(),
    conversationId: original.conversationId,
    senderId: original.conversationId.split('::').find((x) => x !== original.senderId) ?? 'peer',
    senderName: peerName,
    content: `✓ Reçu en local : « ${original.content.slice(0, 80)} »`,
    createdAt: new Date(Date.now() + 600).toISOString(),
    status: 'delivered',
    isMe: false,
    transport: original.transport ?? 'nearby',
  };
}

export async function wipeAllChatData(): Promise<void> {
  await removeKey(KEYS.conversations);
  await removeKey(KEYS.messages);
  await removeKey(KEYS.peers);
}

export function demoPeers(): Peer[] {
  const now = new Date().toISOString();
  return [
    { id: 'demo-ndop', name: 'Ndop_42', signal: 'fort', transport: 'nearby', lastSeen: now, isSimulated: true },
    { id: 'demo-kribi', name: 'Kribi_217', signal: 'moyen', transport: 'nearby', lastSeen: now, isSimulated: true },
    { id: 'demo-waza', name: 'Waza_9', signal: 'faible', transport: 'mesh', lastSeen: now, isSimulated: true },
  ];
}
