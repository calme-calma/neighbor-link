<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import EventCard from './EventCard.vue'; // 既存のEventCardコンポーネントを再利用します

// ★ 最終的に画面に表示するデータを格納する場所
// 形式: [ { category: { id, name, slug }, events: [ ... ] }, ... ]
const categorizedEvents = ref([]);

// ★ データを取得中かどうかを管理するフラグ
const isLoading = ref(true);

// コンポーネントがマウント（表示準備完了）されたら、データを取得する
onMounted(async () => {
  try {
    // --- 1. カテゴリ一覧を'order'順に取得 ---
    const categoriesCollection = collection(db, 'categories');
    const categoriesQuery = query(categoriesCollection, orderBy('order'));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // --- 2. 各カテゴリに属するイベントを取得 ---
    const allCategorizedEvents = [];
    for (const category of categories) {
      const eventsCollection = collection(db, 'events');
      // 'category'フィールドがカテゴリのslugと一致し、
      // 'eventDate'が未来のイベントを5件まで取得
      const eventsQuery = query(
        eventsCollection,
        where('category', '==', category.slug),
        where('eventDate', '>=', new Date()), // 未来のイベントのみ
        orderBy('eventDate', 'asc'),
        limit(5) // 各カテゴリ5件まで
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // イベントが存在するカテゴリのみリストに追加
      if (events.length > 0) {
        allCategorizedEvents.push({
          category: category,
          events: events
        });
      }
    }

    // 取得したデータをrefに格納して画面に反映
    categorizedEvents.value = allCategorizedEvents;

  } catch (error) {
    console.error("Error fetching events by category: ", error);
  } finally {
    // 処理が成功しても失敗しても、ローディング状態を解除
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="event-list-container">
    <!-- ローディング中の表示 -->
    <div v-if="isLoading">
      <p>イベントを読み込んでいます...</p>
    </div>

    <!-- データ取得後の表示 -->
    <div v-else>
      <!-- カテゴリごとにループ -->
      <div 
        v-for="group in categorizedEvents" 
        :key="group.category.id" 
        class="category-section"
      >
        <!-- カテゴリ名を表示 -->
        <h2>{{ group.category.name }}</h2>
        
        <!-- イベントカードを横スライドで表示するコンテナ -->
        <div class="event-scroll-container">
          <EventCard 
            v-for="event in group.events" 
            :key="event.id" 
            :event="event"
          />
        </div>
      </div>
      
      <!-- 表示できるイベントがない場合のメッセージ -->
      <div v-if="!categorizedEvents.length">
        <p>現在開催予定のイベントはありません。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-list-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.category-section {
  margin-bottom: 2.5rem;
}

h2 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
  border-left: 5px solid #f0ad4e;
}

.event-scroll-container {
  display: flex;
  overflow-x: auto; /* ★ 横スクロールを有効にするキープロパティ */
  gap: 1.5rem; /* カード間のスペース */
  padding: 0.5rem 0.5rem 1.5rem 0.5rem; /* スクロールバーのための下パディング */

  /* スクロールバーの見た目を少し良くする（オプション） */
  scrollbar-width: thin;
  scrollbar-color: #ccc #f1f1f1;
}

/* スクロールバー（Chrome, Safari） */
.event-scroll-container::-webkit-scrollbar {
  height: 8px;
}
.event-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.event-scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.event-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>