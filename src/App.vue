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

<!-- src/App.vue の <template> の中身を上書き -->
<template>
  <header>
    <nav>
      <!-- ログインしている時のメニュー -->
      <template v-if="isLoggedIn">
        <RouterLink to="/events">イベント一覧</RouterLink>
        <RouterLink to="/create-event">イベントを作成</RouterLink>
        <RouterLink to="/mypage">マイページ</RouterLink>
        <RouterLink to="/profile">プロフィール編集</RouterLink>
        <button @click="handleSignOut" class="logout-button">ログアウト</button>
      </template>
      <!-- ログインしていない時のメニュー -->
      <template v-else>
        <RouterLink to="/events">イベント一覧</RouterLink>
        <RouterLink to="/login">ログイン</RouterLink>
        <RouterLink to="/signup">新規登録</RouterLink>
      </template>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style>
/* === Google Fonts のインポート === */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');

/* === カラー変数の定義 === */
:root {
  --primary-color: #2596be;   /* メインの青 */
  --accent-color: #ffc700;    /* アクセントの黄 */
  --text-color: #333333;      /* 基本テキスト色 */
  --background-color: #ffffff; /* 基本背景色 */
  --light-gray: #f5f5f5;      /* 薄いグレー */
}

/* === 全体的なスタイルのリセットと基本設定 === */
body {
  margin: 0;
  font-family: 'Noto Sans JP', sans-serif; /* ★フォントを適用！ */
  background-color: var(--background-color); /* ★背景色を適用！ */
  color: var(--text-color); /* ★基本文字色を適用！ */
}

main {
  padding: 1rem;
}

/* === ヘッダー（ナビゲーションバー）のスタイル === */
header {
  background-color: var(--background-color);
  padding: 1rem;
  border-bottom: 1px solid var(--light-gray);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 少し影をつける */
}

nav a {
  margin-right: 1.5rem;
  text-decoration: none;
  color: var(--primary-color); /* ★リンクの色を適用！ */
  font-weight: 700; /* 少し太字に */
}

.logout-button {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  margin-left: 1.5rem;
  font-weight: 700;
  font-family: 'Noto Sans JP', sans-serif; /* ボタンにもフォント適用 */
  font-size: 1em; /* 周りの文字と同じサイズに */
}
</style>