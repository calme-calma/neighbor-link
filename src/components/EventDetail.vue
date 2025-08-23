<script setup>
import { ref, onMounted, computed } from 'vue'; // ★ computed をインポート
import { useRoute, RouterLink } from 'vue-router'; // ★ RouterLink をインポート
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import UserProfileModal from './UserProfileModal.vue';

const route = useRoute();
const event = ref(null);
const eventId = route.params.id;
const isLoggedIn = ref(false);
const isLoading = ref(true);

// ★ 新しく追加するデータを保持するref
const organizer = ref(null);      // 主催者情報
const attendees = ref([]);        // 参加者リスト
const attendeeCount = ref(0);     // 参加者数

//モーダルを制御するためのrefを追加
const isModalVisible = ref(false);

const currentUserAttendance = ref(null); // 自分の参加記録を保持する (IDとステータス)
const isAttending = computed(() => currentUserAttendance.value?.status === 'attending');

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

const isFull = computed(() => {
  // 定員が設定されていない、または0の場合は満員としない
  if (!event.value || !event.value.capacity || event.value.capacity <= 0) {
    return false;
  }
  // 現在の参加者数が定員以上であればtrue (満員) を返す
  return attendeeCount.value >= event.value.capacity;
});

const fetchEventDetails = async () => {
  // onMountedのロジックをここに移動・統合
  try {
    const eventDocRef = doc(db, "events", eventId);
    const eventDocSnap = await getDoc(eventDocRef);
    if (!eventDocSnap.exists()) { console.log("No event doc"); return; }
    event.value = eventDocSnap.data();

    if (event.value.organizerId) {
      const userDocRef = doc(db, "users", event.value.organizerId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) { organizer.value = userDocSnap.data(); }
    }

    const attendanceQuery = query(collection(db, "attendances"), where("eventId", "==", eventId));
    const attendanceSnapshot = await getDocs(attendanceQuery);
    
    // ★ statusがattendingの参加者のみをカウント・表示対象にする
    const activeAttendees = attendanceSnapshot.docs.filter(d => d.data().status === 'attending');
    attendeeCount.value = activeAttendees.length;
    
    const attendeeIds = activeAttendees.slice(0, 10).map(doc => doc.data().userId);
    if (attendeeIds.length > 0) {
      const attendeesQuery = query(collection(db, "users"), where("userId", "in", attendeeIds));
      const attendeesSnapshot = await getDocs(attendeesQuery);
      attendees.value = attendeesSnapshot.docs.map(doc => doc.data());
    } else {
      attendees.value = []; // 参加者が0人になった場合にリストを空にする
    }

    const user = auth.currentUser;
    if (user) {
      const userAttendance = attendanceSnapshot.docs.find(d => d.data().userId === user.uid);
      if (userAttendance) {
        currentUserAttendance.value = { id: userAttendance.id, status: userAttendance.data().status };
      } else {
        currentUserAttendance.value = null; // 参加記録がない場合はnullに
      }
    }
  } catch (error) {
    console.error("Error refetching details:", error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  await fetchEventDetails();
  isLoading.value = false;
});

// ★ キャンセル処理
const handleCancel = async () => {
  if (!currentUserAttendance.value?.id) return;
  
  // 確認ポップアップ
  if (window.confirm('このイベントへの参加を本当にキャンセルしますか？')) {
    try {
      const attendanceDocRef = doc(db, 'attendances', currentUserAttendance.value.id);
      // statusを 'cancelled' に更新
      await updateDoc(attendanceDocRef, { status: 'cancelled' });

      // 画面の状態も更新
      currentUserAttendance.value.status = 'cancelled';
      attendeeCount.value--; // 参加者数を1人減らす
      
      await fetchEventDetails(); // ★ データ再取得
      alert('参加をキャンセルしました。');
    } catch (error) {
      console.error("キャンセルエラー: ", error);
      alert('キャンセル処理中にエラーが発生しました。');
    }
  }
};

// ★ 参加とキャンセルをまとめる関数
const toggleAttendance = () => {
  if (isAttending.value) {
    handleCancel();
  } else {
    handleAttend(); // 既存の参加処理を呼び出す
  }
};

// 「参加する」ボタンのロジック
const handleAttend = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('参加するにはログインが必要です。');
    return;
  }
  try {
    if (currentUserAttendance.value?.status === 'cancelled') {
      // --- もし「キャンセル済み」の記録があれば、それを「参加中」に更新する ---
      const attendanceDocRef = doc(db, 'attendances', currentUserAttendance.value.id);
      await updateDoc(attendanceDocRef, { status: 'attending' });
      
    } else {
      // --- そうでなければ（参加記録が全くない場合）、新しく作成する ---
      await addDoc(collection(db, "attendances"), {
        userId: user.uid,
        eventId: eventId,
        createdAt: serverTimestamp(),
        status: 'attending'
      });
    }

    await fetchEventDetails(); // ★ データ再取得
    alert('イベントへの参加登録が完了しました！');
    // (参加後に参加者数を再取得して画面に反映するロジックなども、今後追加できます)
  } catch (error) {
    console.error("参加登録エラー: ", error);
    alert('エラーが発生しました。');
  }
};

//モーダルを開くための関数を追加
const openProfileModal = () => {
  if (organizer.value) { // 主催者情報がある場合のみ
    isModalVisible.value = true;
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
      
      <!--主催者情報エリアにクリックイベントを追加 -->
      <div v-if="organizer" class="organizer-info" @click="openProfileModal">
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
      <!-- <button v-if="isLoggedIn" @click="handleAttend" class="join-button">このイベントに参加する</button> -->
      <button 
        v-if="isLoggedIn" 
        @click="toggleAttendance" 
        class="join-button"
        :class="{ 'cancel-button': isAttending }"
        :disabled="isFull && !isAttending" 
      >
        <span v-if="isAttending">参加をキャンセルする</span>
        <span v-else-if="isFull">満員御礼</span>
        <span v-else>このイベントに参加する</span>
      </button>

      <RouterLink v-else to="/login" class="join-button">参加するにはログイン</RouterLink>
    </div>
  </div>
  <div v-else class="loading-container"><p>イベントが見つかりませんでした。</p></div>

  <UserProfileModal 
    :is-visible="isModalVisible" 
    :user-id="organizer?.userId" 
    @close="isModalVisible = false"
  />

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

.join-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none; /* ホバーエフェクトも無効化 */
}

.join-button:disabled:hover {
  background-color: #ccc; /* ホバーしても色が変わらないように */
}

.join-button.cancel-button {
  background-color: #d9534f; /* キャンセルボタンは赤色に */
}
.join-button.cancel-button:hover {
  background-color: #c9302c;
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
  cursor: pointer;
  transition: background-color 0.2s;
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

.organizer-info:hover {
  background-color: #f0f0f0;
}

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