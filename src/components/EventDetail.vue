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

onMounted(async () => {
  const eventDocRef = doc(db, "events", eventId);
  const eventDocSnap = await getDoc(eventDocRef);

  if (eventDocSnap.exists()) {
    event.value = eventDocSnap.data();
  } else {
    console.log("No such event document!");
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

    <!-- ★ コンテンツエリア -->
    <div class="content-wrapper">
      <h1>{{ event.title }}</h1>

      <!-- アイコン付き基本情報 -->
      <div class="info-grid">
        <div class="info-item">
          <span class="icon">🗓️</span>
          <span>{{ formattedDate }}</span>
        </div>
        <div class="info-item">
          <span class="icon">📍</span>
          <span>{{ event.location }}</span>
        </div>
      </div>
      
      <hr />
      
      <p class="description">{{ event.description }}</p>
    </div>

    <!-- ★ フローティング参加ボタン -->
    <div class="floating-footer">
      <button v-if="isLoggedIn" @click="handleAttend" class="join-button">このイベントに参加する</button>
      <RouterLink v-else to="/login" class="join-button">参加するにはログイン</RouterLink>
    </div>
  </div>
  <div v-else class="loading-container">
    <p>イベントを読み込んでいます...</p>
  </div>
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
</style>