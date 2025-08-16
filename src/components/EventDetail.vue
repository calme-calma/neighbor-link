<!-- src/components/EventDetail.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const route = useRoute(); // URLの情報を取得するための道具
const event = ref(null); // 取得した単一のイベントを保存する「箱」

onMounted(async () => {
  // URLからイベントのIDを取得 (例: /event/ABCDEFG -> ABCDEFG)
  const eventId = route.params.id;
  
  // 取得したIDを使って、Firestoreから単一のドキュメントへの参照を作成
  const docRef = doc(db, "events", eventId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // ドキュメントが存在すれば、データを「箱」に入れる
    event.value = docSnap.data();
  } else {
    console.log("No such document!");
  }
});
</script>

<template>
  <!-- eventの箱にデータが入ってから表示する -->
  <div v-if="event" class="event-detail">
    <h1>{{ event.title }}</h1>
    <p><strong>日時:</strong> {{ event.eventDate }}</p>
    <p><strong>場所:</strong> {{ event.location }}</p>
    <hr />
    <p>{{ event.description }}</p>
  </div>
  <div v-else>
    <p>イベントを読み込んでいます...</p>
  </div>
</template>

<style scoped>
.event-detail { max-width: 800px; margin: 2rem auto; }
hr { margin: 1rem 0; }
</style>