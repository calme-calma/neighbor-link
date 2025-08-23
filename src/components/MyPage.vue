<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'; // ★ useRouteをインポート
import { RouterLink } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const route = useRoute(); // ★ 現在のルート情報を取得
const activeTab = ref('upcoming'); 
const upcomingEvents = ref([]);
const pastEvents = ref([]);
const hostedEvents = ref([]);
const isLoading = ref(true);

// タイムスタンプをフォーマットする関数 (MyPage.vue内に再定義)
const formatTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '日時情報なし';
  const date = timestamp.toDate();
  return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const fetchMyPageData = async () => {
  const user = auth.currentUser;
  if (!user) {
    isLoading.value = false;
    return;
  }
  
  // onMountedの中身をここに移動
  try {
    const now = Timestamp.now();
    const attendancesQuery = query(collection(db, "attendances"), where("userId", "==", user.uid));
    const attendanceSnapshot = await getDocs(attendancesQuery);
    
    const attendingMap = new Map();
    attendanceSnapshot.docs.forEach(doc => {
      attendingMap.set(doc.data().eventId, doc.data().status);
    });
    const eventIds = Array.from(attendingMap.keys());
    
    if (eventIds.length > 0) {
      const eventsQuery = query(collection(db, "events"), where("__name__", "in", eventIds));
      const eventSnapshot = await getDocs(eventsQuery);
      const allAttendingEvents = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        attendanceStatus: attendingMap.get(doc.id)
      }));
      upcomingEvents.value = allAttendingEvents.filter(event => event.eventDate >= now);
      pastEvents.value = allAttendingEvents.filter(event => event.eventDate < now);
    } else {
      // 参加イベントがない場合にリストを空にする
      upcomingEvents.value = [];
      pastEvents.value = [];
    }

    const hostedQuery = query(collection(db, "events"), where("organizerId", "==", user.uid));
    const hostedSnapshot = await getDocs(hostedQuery);
    hostedEvents.value = hostedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error("Error fetching mypage data:", error);
  } finally {
    isLoading.value = false;
  }
};

// ページが最初に表示されたときにデータを取得
onMounted(fetchMyPageData);

// ★★★ ルート全体の変更を監視する ★★★
// routeオブジェクトそのものを監視することで、より確実に変更を検知する
watch(route, (to, from) => {
  // マイページに遷移してきた場合のみデータを再取得
  // (マイページ内のタブ切り替えなどでは実行されないように)
  if (to.path === '/mypage' && from.path !== '/mypage') {
    fetchMyPageData();
  }
});
</script>

<template>
  <div class="mypage-container">
    <h1>マイページ</h1>

    <!-- ★ タブ切り替えUI -->
    <div class="tabs">
      <button @click="activeTab = 'upcoming'" :class="{ active: activeTab === 'upcoming' }">
        参加予定 ({{ upcomingEvents.length }})
      </button>
      <button @click="activeTab = 'past'" :class="{ active: activeTab === 'past' }">
        参加済 ({{ pastEvents.length }})
      </button>
      <button @click="activeTab = 'hosted'" :class="{ active: activeTab === 'hosted' }">
        主催イベント ({{ hostedEvents.length }})
      </button>
    </div>

    <!-- ★ コンテンツ表示エリア -->
    <div class="tab-content">
      <div v-if="isLoading"><p>読み込み中...</p></div>
      
      <!-- 参加予定リスト -->
      <div v-show="activeTab === 'upcoming'">
        <ul v-if="upcomingEvents.length > 0" class="events-grid">
          <li v-for="event in upcomingEvents" :key="event.id" class="event-card">
            <RouterLink :to="'/event/' + event.id">
              <!-- ★ キャンセル済みラベル -->
              <div v-if="event.attendanceStatus === 'cancelled'" class="status-label cancelled">
                キャンセル済
              </div>
              <img v-if="event.imageUrl" :src="event.imageUrl" class="card-image">
              <div class="card-content">
                <h3>{{ event.title }}</h3>
                <p>🗓️ {{ formatTimestamp(event.eventDate) }}</p>
                <p>📍 {{ event.location }}</p>
              </div>
            </RouterLink>
          </li>
        </ul>
        <p v-else>参加予定のイベントはありません。</p>
      </div>

      <!-- 参加済リスト -->
      <div v-show="activeTab === 'past'">
        <ul v-if="pastEvents.length > 0" class="events-grid">
          <li v-for="event in pastEvents" :key="event.id" class="event-card">
            <RouterLink :to="'/event/' + event.id">
              <img v-if="event.imageUrl" :src="event.imageUrl" class="card-image">
              <div class="card-content">
                <h3>{{ event.title }}</h3>
                <p>🗓️ {{ formatTimestamp(event.eventDate) }}</p>
              </div>
            </RouterLink>
          </li>
        </ul>
        <p v-else>参加済のイベントはありません。</p>
      </div>

      <!-- 主催イベントリスト -->
      <div v-show="activeTab === 'hosted'">
        <ul v-if="hostedEvents.length > 0" class="events-grid">
          <li v-for="event in hostedEvents" :key="event.id" class="event-card">
            <RouterLink :to="'/event/' + event.id">
              <img v-if="event.imageUrl" :src="event.imageUrl" class="card-image">
              <div class="card-content">
                <h3>{{ event.title }}</h3>
                <p>🗓️ {{ formatTimestamp(event.eventDate) }}</p>
              </div>
            </RouterLink>
          </li>
        </ul>
        <p v-else>主催したイベントはありません。</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ★★★ ここからスタイルを全面的に刷新 ★★★ */
.mypage-container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
h1 { margin-bottom: 2rem; }

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 2rem;
}
.tabs button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #777;
  position: relative;
}
.tabs button.active {
  color: #f0ad4e;
}
.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #f0ad4e;
}

.events-grid {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.event-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative; /* ラベル表示の基準点 */
}
.event-card a { text-decoration: none; color: inherit; }
.card-image {
  height: 150px;
  background-color: #e0f7fa;
}
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.card-content { padding: 1rem; }
.card-content h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
.card-content p { margin: 0; color: #555; }

.status-label.cancelled {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(108, 117, 125, 0.8);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: bold;
  z-index: 10;
}
.event-card a:has(.status-label.cancelled) {
  opacity: 0.7; /* キャンセル済みは少し薄く表示 */
}
</style>