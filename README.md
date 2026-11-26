# UpChat RN

Vision React Native (Expo) d’UpChat : messagerie **offline-first**, **sans compte**, UI française, accent bleu.

## Principes

- Identité éphémère locale (pseudonyme + empreinte), aucun email / numéro obligatoire
- Discussions persistées sur l’appareil (AsyncStorage)
- Radar de proximité avec pairs de démonstration (BLE réel = étape suivante native)
- Echo local pour prouver l’envoi/réception hors ligne
- Thèmes clair / sombre / OLED
- Laboratoire à drapeaux (radar, mesh, salles, effacement d’urgence…)
- Mode internet hybride optionnel

## Lancer (téléphone)

```bash
npm install
npx expo start
```

Ouvre **Expo Go** sur iPhone ou Android et scanne le QR.

## Ce qui fonctionne vraiment

1. Onboarding sans compte
2. 4 onglets : Échanges, Proximité, Contacts, Réglages
3. Radar → Discuter → messages persistés + réponse locale
4. Thèmes + Laboratoire + wipe d’urgence

## Limites honnêtes

Le radar est une **démo locale**. Le mesh BLE multi-appareils réel demande un module natif (étape 2).

Repo : https://github.com/alexchep47-gif/upchat-rn
