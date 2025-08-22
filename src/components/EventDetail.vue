<script setup>
import { ref, onMounted, computed } from 'vue'; // ★ computed をインポート
import { useRoute, RouterLink } from 'vue-router'; // ★ RouterLink をインポート
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const event = ref(null);
const eventId = route.params.id;
const isLoggedIn = ref(false);
const isLoading = ref(true);

// ★ 新しく追加するデータを保持するref
const organizer = ref(null);      // 主催者情報
const attendees = ref([]);        // 参加者リスト
const attendeeCount = ref(0);     // 参加者数

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
});

// ★ 日付をフォーマットする computed プロパティ
const formattedDate = computed(() => {
  if (!event.value || !event.value.eventDate || typeof event.value.eventDate.toDate !== 'function') {
    return '日時情報なし';
  }
  const date = event.value.eventDate.toDate();
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// --- ★ データ取得ロジックを大幅に強化 ---
onMounted(async () => {
  try {
    // --- 1. イベントの基本情報を取得 ---
    const eventDocRef = doc(db, "events", eventId);
    const eventDocSnap = await getDoc(eventDocRef);
    if (!eventDocSnap.exists()) {
      console.log("No such event document!");
      return;
    }
    event.value = eventDocSnap.data();

    // --- 2. 主催者のプロフィール情報を取得 ---
    if (event.value.organizerId) {
      const userDocRef = doc(db, "users", event.value.organizerId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        organizer.value = userDocSnap.data();
      }
    }

    // --- 3. 参加者リストを取得 ---
    const attendanceQuery = query(collection(db, "attendances"), where("eventId", "==", eventId));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    attendeeCount.value = attendanceSnapshot.size; // 参加者数を更新
    
    // 参加者のプロフィール情報を取得 (最大10人まで表示)
    const attendeeIds = attendanceSnapshot.docs.slice(0, 10).map(doc => doc.data().userId);
    if (attendeeIds.length > 0) {
      const attendeesQuery = query(collection(db, "users"), where("userId", "in", attendeeIds));
      const attendeesSnapshot = await getDocs(attendeesQuery);
      attendees.value = attendeesSnapshot.docs.map(doc => doc.data());
    }

  } catch (error) {
    console.error("Error fetching event details:", error);
  } finally {
    isLoading.value = false;
  }
});

const handleAttend = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('参加するにはログインが必要です。');
    return;
  }
  try {
    // ここで既に参加済みかどうかのチェックを入れるとより親切になります（今後の課題）
    await addDoc(collection(db, "attendances"), {
      userId: user.uid,
      eventId: eventId,
      createdAt: serverTimestamp()
    });
    alert('イベントへの参加登録が完了しました！');
  } catch (error) {
    console.error("参加登録エラー: ", error);
    alert('エラーが発生しました。');
  }
};
</script>

<template>
  <div v-if="event" class="event-detail-page">
    <!-- ★ ヒーローイメージエリア -->
    <div class="hero-image">
      <img v-if="event.imageUrl" :src="event.imageUrl" alt="イベントメイン画像">
    </div>

   <div class="content-wrapper">
      <!-- ★ 雰囲気タグ -->
      <div v-if="event.tags && event.tags.length > 0" class="tags-container">
        <span v-for="tag in event.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <h1>{{ event.title }}</h1>
      
      <!-- ★ 主催者情報 -->
      <div v-if="organizer" class="organizer-info">
        <img :src="organizer.iconUrl || '/symbol-logo.png'" class="organizer-icon">
        <div>
          <span>主催者</span>
          <strong>{{ organizer.name || '名前未設定' }}</strong>
        </div>
      </div>

      <!-- 基本情報グリッド -->
      <div class="info-grid">
        <div class="info-item"><span>🗓️</span><span>{{ formattedDate }}</span></div>
        <div class="info-item"><span>📍</span><span>{{ event.location }}</span></div>
        <!-- ★ 参加費 -->
        <div v-if="event.price" class="info-item"><span>💰</span><span>{{ event.price }}</span></div>
      </div>
      <hr />

      <p class="description">{{ event.description }}</p>
      
      <!-- ★ 参加者リスト (attendeeCountが1以上の場合のみ、このブロック全体が表示される) -->
      <div v-if="attendeeCount > 0" class="attendees-section">
        <h3>参加者 ({{ attendeeCount }}人)</h3>
        <div class="attendees-list">
          <img v-for="attendee in attendees" :key="attendee.userId" :src="attendee.iconUrl || '/symbol-logo.png'" :title="attendee.name" class="attendee-icon">
        </div>
      </div>

    </div>

    <div class="floating-footer">
      <button v-if="isLoggedIn" @click="handleAttend" class="join-button">このイベントに参加する</button>
      <RouterLink v-else to="/login" class="join-button">参加するにはログイン</RouterLink>
    </div>
  </div>
  <div v-else class="loading-container"><p>イベントが見つかりませんでした。</p></div>
</template>

<style scoped>
/* ★★★ ここからスタイルを全面的に置き換え ★★★ */
.event-detail-page {
  padding-bottom: 100px; /* フローティングボタンの高さ分の余白 */
  background-color: #f5f5f5; /* ★ ページ全体に薄い背景色を追加 */
}

.hero-image {
  width: 100%;
  height: 40vh;
  background-color: #e0f7fa;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-wrapper {
  max-width: 800px;
  /* ★ ここが重要な変更点！マイナスマージンを削除 */
  margin: 2rem auto; /* 上下に余白を取り、左右中央揃えに */
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08); /* 影を少し薄く調整 */
  padding: 2.5rem;
}

h1 {
  font-size: 2.2rem;
  margin: 0;
  line-height: 1.3;
}

.info-grid {
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
  font-size: 1.1rem;
  color: #555;
}

.info-item {
  display: flex;
  align-items: center;
}

.icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}

hr {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid #eee;
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.floating-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  z-index: 100;
}

.join-button {
  display: inline-block;
  width: 100%;
  max-width: 400px;
  padding: 1rem;
  background-color: #f0ad4e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.join-button:hover {
  background-color: #ec971f;
  transform: scale(1.02);
}

.loading-container {
  padding: 2rem;
  text-align: center;
}
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.tag {
  background-color: #f0ad4e;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
  font-size: 0.9rem;
  font-weight: bold;
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 12px;
}
.organizer-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.organizer-info div {
  display: flex;
  flex-direction: column;
}
.organizer-info span { font-size: 0.8rem; color: #777; }
.organizer-info strong { font-size: 1.1rem; }

.attendees-section {
  margin-top: 2.5rem;
}
.attendees-section h3 {
  font-size: 1.2rem;
  border-bottom: 2px solid #f0ad4e;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.attendees-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.attendee-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}
</style>