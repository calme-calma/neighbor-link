<!-- src/components/MyPage.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { RouterLink } from 'vue-router';

const attendingEvents = ref([]); // 参加予定のイベント情報を入れる「箱」

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    // --- 第1段階：自分の参加記録を探す ---
    const attendancesQuery = query(collection(db, "attendances"), where("userId", "==", user.uid));
    const attendanceSnapshot = await getDocs(attendancesQuery);
    const eventIds = attendanceSnapshot.docs.map(doc => doc.data().eventId);

    // --- 第2段階：参加記録のあるイベントの詳細情報を取得 ---
    if (eventIds.length > 0) {
      const eventPromises = eventIds.map(id => getDoc(doc(db, "events", id)));
      const eventDocs = await Promise.all(eventPromises);
      
      attendingEvents.value = eventDocs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }
});
</script>

<template>
  <div class="my-page">
    <h2>マイページ（参加予定のイベント）</h2>
    <div v-if="attendingEvents.length > 0">
      <ul>
        <li v-for="event in attendingEvents" :key="event.id">
          <RouterLink :to="'/event/' + event.id">
            <h3>{{ event.title }}</h3>
            <p>{{ event.eventDate }}</p>
          </RouterLink>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>参加予定のイベントはまだありません。</p>
    </div>
  </div>
</template>

<style scoped>
/* EventsList.vueのスタイルを参考にしています */
.my-page { max-width: 800px; margin: 2rem auto; }
ul { list-style: none; padding: 0; }
li { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; padding: 1rem; }
li a { text-decoration: none; color: inherit; }
h3 { margin-top: 0; }
</style>