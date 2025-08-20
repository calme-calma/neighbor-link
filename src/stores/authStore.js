// src/stores/authStore.js (完成版)
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuth, onAuthStateChanged,signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isLoggedIn = ref(false);
  const isAuthReady = ref(false);
  let authReadyPromise = null; // ★ 待機用のPromiseを追加

  const auth = getAuth();

  // ★ 認証状態の監視をPromiseでラップする
  authReadyPromise = new Promise(resolve => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser;
      isLoggedIn.value = !!firebaseUser;
      if (!isAuthReady.value) {
        isAuthReady.value = true;
        resolve(); // 準備ができたらPromiseを解決
      }
    });
  });

  // ★ 外部から待機できるように関数を公開
  const waitForAuth = () => authReadyPromise;

  // ログアウトメソッドを追加
  const logout = async () => {
    try {
      await signOut(auth);
      // サインアウト成功後、ストアの状態をリセット
      user.value = null;
      isLoggedIn.value = false;
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { user, isLoggedIn, isAuthReady, waitForAuth, logout };
});