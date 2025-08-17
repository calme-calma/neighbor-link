<!-- src/App.vue -->
<script setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const isLoggedIn = ref(false);
const router = useRouter();
const auth = getAuth();

// ユーザーのログイン状態を監視し、isLoggedInの値を更新する
onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
});

// ログアウト処理
const handleSignOut = () => {
  signOut(auth).then(() => {
    // ログアウト後、ログインページに移動
    router.push('/login');
  });
};
</script>

<template>
  <header>
    <nav>
      <!-- ログインしている時だけ表示するリンク -->
      <template v-if="isLoggedIn">
        <RouterLink to="/events">イベント一覧</RouterLink>
        <RouterLink to="/mypage">マイページ</RouterLink>
        <RouterLink to="/profile">プロフィール編集</RouterLink>
        <button @click="handleSignOut" class="logout-button">ログアウト</button>
      </template>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style>
/* 全体に適用される基本スタイル */
body { font-family: sans-serif; margin: 0; }
main { padding: 1rem; }
header { background-color: #f8f8f8; padding: 1rem; border-bottom: 1px solid #ddd; }
nav a { margin-right: 1rem; text-decoration: none; color: #42b983; }
.logout-button { background: none; border: none; color: #42b983; cursor: pointer; padding: 0; margin-left: 1rem; }
</style>