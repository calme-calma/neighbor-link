<!-- src/App.vue -->
<!-- src/App.vue の <script setup> -->
<script setup>
import { ref, onMounted } from 'vue'; // onMounted をインポートに追加
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import logo from './assets/symbol-logo.png';
import SplashScreen from './components/SplashScreen.vue'; // ★ SplashScreenをインポート

const isLoggedIn = ref(false);
const router = useRouter();
const auth = getAuth();

// --- ★ ここからがアニメーション用の新しいロジック ---
const isLoading = ref(true); // スプラッシュスクリーンを表示中かどうかのスイッチ
const isAnimating = ref(false); // アニメーションが実行中かどうかのスイッチ

// ページが読み込まれたら、アニメーションを開始
onMounted(() => {
  // 1.5秒待ってから、アニメーションを開始
  setTimeout(() => {
    isAnimating.value = true;
    // さらにアニメーション時間(0.8秒)待ってから、スプラッシュスクリーンを完全に非表示にする
    setTimeout(() => {
      isLoading.value = false;
    }, 800);
  }, 1500);
});
// --- ★ アニメーション用ロジックここまで ---

onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
});

const handleSignOut = () => { /* ... 変更なし ... */ };
</script>

<!-- src/App.vue の <template> の中身を上書き -->
<template>
  <SplashScreen v-if="isLoading" :class="{ 'is-animating': isAnimating }" />

  <header :class="{ 'is-animating': isAnimating }">
    <div class="nav-container">
      <RouterLink to="/events" class="brand-identity">
        <img :src="logo" alt="Neighbor Link Symbol" class="symbol-logo" />
        <span class="service-name">Neighbor Link</span>
      </RouterLink>

      <button @click="isMenuOpen = !isMenuOpen" class="hamburger-button">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav :class="{ 'is-open': isMenuOpen }">
        <!-- ログインしている時のメニュー -->
        <template v-if="isLoggedIn">
          <RouterLink to="/events" @click="isMenuOpen = false">イベント一覧</RouterLink>
          <RouterLink to="/create-event" @click="isMenuOpen = false">イベントを作成</RouterLink>
          <RouterLink to="/mypage" @click="isMenuOpen = false">マイページ</RouterLink>
          <RouterLink to="/profile" @click="isMenuOpen = false">プロフィール編集</RouterLink>
          <button @click="handleSignOut" class="logout-button">ログアウト</button>
        </template>
        <!-- ログインしていない時のメニュー -->
        <template v-else>
          <RouterLink to="/events" @click="isMenuOpen = false">イベント一覧</RouterLink>
          <RouterLink to="/login" @click="isMenuOpen = false">ログイン</RouterLink>
          <RouterLink to="/signup" @click="isMenuOpen = false">新規登録</RouterLink>
        </template>
      </nav>
    </div>
  </header>

  <main :class="{ 'is-animating': isAnimating }">
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
  padding: 0.75rem 1rem; /* 上下の余白を少し調整 */
  border-bottom: 1px solid var(--light-gray);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-identity {
  display: flex;
  align-items: center;
  text-decoration: none; /* リンクの下線を消す */
}

.symbol-logo {
  height: 32px; /* ★ロゴの高さを少し小さめに調整 */
  width: auto;
  margin-right: 0.75rem; /* ロゴと文字の間の余白 */
}

.service-name {
  font-size: 1.25rem; /* 文字サイズを少し大きく */
  font-weight: 700; /* 太字に */
  color: var(--text-color); /* 文字色を指定 */
}

nav a {
  margin-left: 1.5rem;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 700;
  transition: color 0.2s;
}
nav a:hover {
  color: var(--primary-color);
}

.logout-button {
  background: none;
  border: none;
  color: var(--text-color); /* 通常時の色をテキストカラーに合わせる */
  cursor: pointer;
  padding: 0;
  margin-left: 1.5rem; /* 他のリンクとの間隔を合わせる */
  font-weight: 700; /* 他のリンクと太さを合わせる */
  font-size: 1rem; /* 他のリンクとサイズを合わせる */
  font-family: inherit; /* 親要素のフォントを継承する */
  transition: color 0.2s;
}

.logout-button:hover {
  color: var(--color-primary); /* ホバー時の色をメインカラーに */
}
</style>