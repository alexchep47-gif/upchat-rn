export type ThemeMode = 'light' | 'dark' | 'oled';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type Transport = 'local' | 'nearby' | 'mesh' | 'internet';

export interface Identity {
  id: string;
  pseudonym: string;
  createdAt: string;
  fingerprint: string;
}

export interface Peer {
  id: string;
  name: string;
  isFavorite?: boolean;
  lastSeen?: string;
  signal?: 'fort' | 'moyen' | 'faible';
  transport?: Transport;
  isSimulated?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  status: MessageStatus;
  isMe: boolean;
  transport?: Transport;
}

export interface Conversation {
  id: string;
  peerId: string;
  peerName: string;
  lastMessage?: string;
  lastAt?: string;
  unread: number;
  pinned?: boolean;
}

export interface FeatureFlags {
  lab_ephemeral_identity: boolean;
  lab_radar_discovery: boolean;
  lab_favorites_alert: boolean;
  lab_mesh_relay: boolean;
  lab_rooms: boolean;
  lab_urgent_wipe: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  internetMode: boolean;
  flags: FeatureFlags;
  onboardingDone: boolean;
}
