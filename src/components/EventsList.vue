<!-- src/components/EventsList.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { RouterLink } from 'vue-router';

// 取得したイベントを保存するための「箱」
const events = ref([]);

// このページが表示された瞬間に一度だけ実行される処理
onMounted(async () => {
  // 'events'コレクションへの参照を取得
  const querySnapshot = await getDocs(collection(db, "events"));

  // 取得した各ドキュメントをループ処理
  querySnapshot.forEach((doc) => {
    // ドキュメントのデータと、そのドキュメント自身のIDを配列に追加
    events.value.push({ id: doc.id, ...doc.data() });
  });
});
</script>

<template>
  <div class="events-list">
    <h2>開催予定のイベント</h2>
    <ul>
      <!-- liに新しいクラス名をつけ、カードデザインを適用 -->
      <li v-for="event in events" :key="event.id" class="event-card">
        <RouterLink :to="'/event/' + event.id">
          <h3>{{ event.title }}</h3>
          <!-- 日時や場所などの情報を追加すると、よりリッチになる -->
          <p>{{ event.eventDate }}</p>
          <p>📍 {{ event.location }}</p> <!-- 絵文字でアイコン代わりに -->
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.events-list {
  max-width: 1200px; /* PC表示を考慮して、最大幅を広げる */
  margin: 2rem auto;
  padding: 0 1rem; /* スマホ表示で左右に余白を */
}

/* カードを横に並べるためのグリッドコンテナ */
ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr; /* スマホでは縦1列が基本 */
  gap: 1.5rem; /* カード間の余白 */
}

/* イベントカード本体のスタイル */
.event-card {
  background-color: white;
  border-radius: 16px; /* 角を大きく丸める */
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); /* 浮き上がって見える影 */
  overflow: hidden; /* 角丸からはみ出す要素を隠す */
  transition: transform 0.2s, box-shadow 0.2s; /* アニメーションの設定 */
}

/* マウスを乗せると少し浮き上がるエフェクト */
.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.event-card a {
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 1.5rem; /* カード内の余白 */
}

h3 {
  margin-top: 0;
  color: var(--primary-color); /* タイトルの色をメインカラーに */
}

/* ★★★ ここからがレスポンシブ対応 ★★★ */

/* 画面幅が768px以上（タブレット）になったら */
@media (min-width: 768px) {
  ul {
    grid-template-columns: repeat(2, 1fr); /* カードを横2列に */
  }
}

/* 画面幅が1024px以上（PC）になったら */
@media (min-width: 1024px) {
  ul {
    grid-template-columns: repeat(3, 1fr); /* カードを横3列に */
  }
}
</style>