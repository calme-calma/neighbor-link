<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import EventCard from './EventCard.vue';

const route = useRoute();
const events = ref([]);
const categoryName = ref('');
const isLoading = ref(true);

// URLの :slug パラメータを取得
const categorySlug = computed(() => route.params.slug);

onMounted(async () => {
  if (!categorySlug.value) return;

  try {
    // --- 1. slugを元にカテゴリ名を取得 ---
    const catQuery = query(collection(db, 'categories'), where('slug', '==', categorySlug.value));
    const catSnapshot = await getDocs(catQuery);
    if (!catSnapshot.empty) {
      categoryName.value = catSnapshot.docs[0].data().name;
    }

    // --- 2. slugを元に該当カテゴリのイベントを全て取得 ---
    const eventsQuery = query(
      collection(db, 'events'),
      where('category', '==', categorySlug.value),
      where('eventDate', '>=', new Date()),
      orderBy('eventDate', 'asc')
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    events.value = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error("Error fetching category events: ", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="category-events-container">
    <h1 v-if="categoryName">「{{ categoryName }}」のイベント一覧</h1>
    <h1 v-else>イベント一覧</h1>

    <div v-if="isLoading">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="events.length > 0" class="events-grid">
      <EventCard 
        v-for="event in events" 
        :key="event.id" 
        :event="event" 
      />
    </div>
    <div v-else>
      <p>このカテゴリの開催予定イベントは現在ありません。</p>
    </div>
  </div>
</template>

<style scoped>
.category-events-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  padding-left: 0.5rem;
  border-left: 5px solid #f0ad4e;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
</style>