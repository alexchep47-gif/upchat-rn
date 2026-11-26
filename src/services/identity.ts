import * as Crypto from 'expo-crypto';
import type { Identity } from '../types';
import { shortFingerprint } from '../utils/id';
import { KEYS, loadJson, removeKey, saveJson } from './storage';

const PSEUDONYMS = [
  'Baobab', 'Harmattan', 'Sahel', 'Mango', 'Kribi', 'Limbe', 'Ndop',
  'Faro', 'Waza', 'Nyong', 'Sanaga', 'Mandara', 'Adamawa', 'Ebogo',
];

export function suggestPseudonym(): string {
  const base = PSEUDONYMS[Math.floor(Math.random() * PSEUDONYMS.length)];
  const n = Math.floor(100 + Math.random() * 900);
  return `${base}${n}`;
}

export async function loadIdentity(): Promise<Identity | null> {
  return loadJson<Identity | null>(KEYS.identity, null);
}

export async function createIdentity(pseudonym: string): Promise<Identity> {
  const id = Crypto.randomUUID();
  const identity: Identity = {
    id,
    pseudonym: pseudonym.trim() || suggestPseudonym(),
    createdAt: new Date().toISOString(),
    fingerprint: shortFingerprint(id),
  };
  await saveJson(KEYS.identity, identity);
  return identity;
}

export async function updatePseudonym(identity: Identity, pseudonym: string): Promise<Identity> {
  const next = { ...identity, pseudonym: pseudonym.trim() || identity.pseudonym };
  await saveJson(KEYS.identity, next);
  return next;
}

export async function wipeIdentity(): Promise<void> {
  await removeKey(KEYS.identity);
}
