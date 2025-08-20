<!-- src/components/EventDetail.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { db } from '../firebase'; // authのインポートは不要なので削除
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'; // addDocとserverTimestampを追加
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const event = ref(null);
const creatorProfile = ref(null); // 主催者プロフィールを入れる箱
const organizer = ref(null); 
const eventId = route.params.id;
const isLoggedIn = ref(false);

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
});

// onMountedで、イベント情報と主催者情報を両方取得する
onMounted(async () => {
  // --- 1. イベント情報の取得 ---
  const eventDocRef = doc(db, "events", eventId);
  const eventDocSnap = await getDoc(eventDocRef);

  if (!eventDocSnap.exists()) {
    console.log("No such document!");
    return; // イベントが見つからなければ、ここで処理を終了
  }
  
  const eventData = eventDocSnap.data();
  event.value = eventData;

  // --- 2. 主催者情報の取得 ---
  // イベント情報にorganizerIdが含まれていれば
  if (eventData.organizerId) {
    // 'users'コレクションから、organizerIdと一致するuserIdを持つプロフィールを探す
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userId", "==", eventData.organizerId));
    const querySnapshot = await getDocs(q);

    // もしプロフィールが見つかれば
    if (!querySnapshot.empty) {
      organizer.value = querySnapshot.docs[0].data(); // データを「箱」に入れる
    }
  }
});

// 「参加する」ボタンのロジックは、以前のフェーズで完成しているので変更なし
const handleAttend = async () => {
  if (confirm('このイベントに参加しますか？')) {
    const user = auth.currentUser;
    if (!user) {
      alert('参加するにはログインが必要です。');
      return;
    }

    try {
      // --- ★★★ ここからが重複チェックのロジック ★★★ ---

      // 1. データベースに問い合わせる準備
      const attendancesRef = collection(db, "attendances");
      const q = query(attendancesRef, 
        where("userId", "==", user.uid), 
        where("eventId", "==", eventId)
      );

      // 2. 問い合わせを実行
      const querySnapshot = await getDocs(q);

      // 3. 結果を判断
      if (!querySnapshot.empty) {
        // もし結果が「空でなかった」ら、それは既に参加済みということ
        alert('あなたはこのイベントに既に参加しています。');
      } else {
        // もし結果が「空だった」ら、まだ参加していないので登録処理を実行
        await addDoc(collection(db, "attendances"), {
          userId: user.uid,
          eventId: eventId,
          createdAt: serverTimestamp()
        });
        alert('イベントへの参加登録が完了しました！');
      }
      // --- ★★★ 重複チェックのロジックここまで ★★★ ---

    } catch (error) {
      console.error("参加登録エラー: ", error);
      alert('エラーが発生しました。');
    }
  }
};
</script>

<template>
  <div v-if="event" class="event-detail-container">
    <!-- メイン写真エリア（プレースホルダー） -->
    <div class="main-image"></div>

    <div class="content-wrapper">
      <h1 class="heading-main">{{ event.title }}</h1>

      <!-- アイコン付き基本情報 -->
      <div class="info-grid">
        <div class="info-item">
          <span class="icon">🗓️</span>
          <span>{{ event.eventDate }}</span>
        </div>
        <div class="info-item">
          <span class="icon">📍</span>
          <span>{{ event.location }}</span>
        </div>
      </div>
      
      <hr />

      <div v-if="organizer" class="organizer-info card">
        <h4>主催者</h4>
        <div class="organizer-profile">
          <!-- 将来ここにプロフィール画像が入る -->
          <div class="organizer-avatar"></div> 
          <div class="organizer-details">
            <strong>{{ organizer.nickname }}</strong>
            <!-- <p>自己紹介文などをここに表示</p> -->
          </div>
        </div>
        <!-- 注意：まだ主催者の公開プロフィールページはないので、このリンクは将来のための準備です -->
        <!-- <RouterLink :to="'/user/' + organizer.userId">プロフィールを見る</RouterLink> -->
      </div>
      <p class="description">{{ event.description }}</p>
    </div>

    <!-- フローティング参加ボタン -->
    <div class="floating-footer">
      <button v-if="isLoggedIn" @click="handleAttend" class="button button-primary">このイベントに参加する</button>
      <RouterLink v-else to="/login" class="button button-primary">参加するにはログイン</RouterLink>
    </div>

  </div>
  <div v-else>
    <p>イベントを読み込んでいます...</p>
  </div>
</template>

<style scoped>
.event-detail-container {
  padding-bottom: 100px; /* フローティングボタンの高さ分、余白を確保 */
}
.main-image {
  width: 100%;
  height: 40vh; /* 画面の高さの40% */
  background-color: var(--color-secondary);
}
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.info-grid {
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
  font-size: 1.1rem;
}
.info-item {
  display: flex;
  align-items: center;
}
.icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}
hr { margin: 2rem 0; border-color: var(--color-border); }
.description { line-height: 1.8; }

/* 主催者情報用のスタイル */
.organizer-info {
  margin-bottom: 2rem;
  padding: 1.5rem; /* カードのスタイルを少し上書き */
}
.organizer-info h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-family: 'M PLUS Rounded 1c', sans-serif;
}
.organizer-profile {
  display: flex;
  align-items: center;
}
.organizer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%; /* 円形にする */
  background-color: var(--color-secondary); /* 仮の背景色 */
  margin-right: 1rem;
}
.organizer-details strong {
  font-size: 1.1rem;
}

/* フローティングフッターのスタイル */
.floating-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  padding: 1rem 2rem;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  z-index: 10;
}
.floating-footer .button {
  width: 100%;
  max-width: 400px;
}
</style>