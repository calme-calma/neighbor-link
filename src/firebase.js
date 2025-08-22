import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// ★★★ この一行を、必要な関数がすべて含まれたものに修正 ★★★
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, limit, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, auth, storage };