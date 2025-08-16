// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ▼▼▼ フェーズ1でメモした、あなたの「合言葉」をここに貼り付け ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyChWxqFZokGuB4wgbuQ2J9iZGrvP2v1vSs",
  authDomain: "neighbor-link-6591c.firebaseapp.com",
  projectId: "neighbor-link-6591c",
  storageBucket: "neighbor-link-6591c.firebasestorage.app",
  messagingSenderId: "237938901818",
  appId: "1:237938901818:web:bba796d44e7e13ed350603"
};
// ▲▲▲ フェーズ1でメモした、あなたの「合言葉」をここに貼り付け ▲▲▲

const app = initializeApp(firebaseConfig);

// 他のファイルで使えるように、機能をエクスポート（外部に公開）します
export const auth = getAuth(app);
export const db = getFirestore(app);