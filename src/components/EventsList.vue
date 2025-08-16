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
      <!-- eventsの箱の中身が空になるまで、li要素を繰り返す -->
      <li v-for="event in events" :key="event.id">
        <!-- 各イベントの詳細ページへのリンク -->
        <RouterLink :to="'/event/' + event.id">
          <h3>{{ event.title }}</h3>
          <p>{{ event.eventDate }}</p>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.events-list { max-width: 800px; margin: 2rem auto; }
ul { list-style: none; padding: 0; }
li { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; padding: 1rem; }
li a { text-decoration: none; color: inherit; }
h3 { margin-top: 0; }
</style>