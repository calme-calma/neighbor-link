<!-- src/components/EventsList.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import EventCard from './EventCard.vue';
//import { RouterLink } from 'vue-router';

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
    <h2 class="heading-main">開催予定のイベント</h2>
    <div class="events-grid">
      <!-- v-for で EventCard を繰り返す -->
      <RouterLink v-for="event in events" :key="event.id" :to="'/event/' + event.id" class="event-link">
        <EventCard :event="event" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.events-list {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.events-grid {
  display: grid;
  /* PCでは3列、タブレットでは2列、スマホでは1列になる魔法のコード */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.event-link {
  text-decoration: none;
}
</style>