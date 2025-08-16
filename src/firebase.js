// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ▼▼▼ フェーズ1でメモした、あなたの「合言葉」をここに貼り付け ▼▼▼
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};
// ▲▲▲ フェーズ1でメモした、あなたの「合言葉」をここに貼り付け ▲▲▲

const app = initializeApp(firebaseConfig);

// 他のファイルで使えるように、機能をエクスポート（外部に公開）します
export const auth = getAuth(app);
export const db = getFirestore(app);