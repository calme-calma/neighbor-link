<!-- src/components/EventDetail.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase'; // authのインポートは不要なので削除
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'; // addDocとserverTimestampを追加
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute();
const event = ref(null);
const creatorProfile = ref(null); // 主催者プロフィールを入れる箱
const eventId = route.params.id;
const isLoggedIn = ref(false);

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
});

// onMountedで、イベント情報と主催者情報を両方取得する
onMounted(async () => {
  // 1. まずイベント情報を取得
  const eventDocRef = doc(db, "events", eventId);
  const eventDocSnap = await getDoc(eventDocRef);

  if (eventDocSnap.exists()) {
    const eventData = eventDocSnap.data();
    event.value = eventData;

    // 2. イベント情報から主催者のID (creatorId) を取得
    const creatorId = eventData.creatorId;
    if (creatorId) {
      // 3. creatorIdを使って、usersコレクションから主催者のプロフィールを探す
      const q = query(collection(db, "users"), where("userId", "==", creatorId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 4. 見つかったプロフィールを箱に入れる
        creatorProfile.value = querySnapshot.docs[0].data();
      }
    }
  } else {
    console.log("No such event document!");
  }
});

// 「参加する」ボタンのロジックは、以前のフェーズで完成しているので変更なし
const handleAttend = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('参加するにはログインが必要です。');
    return;
  }
  try {
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
  <!-- eventの箱にデータが入ってから表示する -->
  <div v-if="event" class="event-detail">
    <h1>{{ event.title }}</h1>
    <p><strong>日時:</strong> {{ event.eventDate }}</p>
    <p><strong>場所:</strong> {{ event.location }}</p>
    <hr />
    <p>{{ event.description }}</p>
    <div v-if="creatorProfile" class="creator-profile">
      <h3>主催者: {{ creatorProfile.nickname || creatorProfile.name }}</h3>
      <p><strong>最寄り駅:</strong> {{ creatorProfile.station || '未設定' }}</p>
      <p><strong>休日:</strong> {{ creatorProfile.holiday || '未設定' }}</p>
      <!-- interestsが配列で存在する場合のみ、カンマ区切りの文字列にして表示 -->
      <p v-if="creatorProfile.interests && creatorProfile.interests.length > 0">
        <strong>興味のあること:</strong> {{ creatorProfile.interests.join(', ') }}
      </p>
      <hr>
      <p>{{ creatorProfile.introduction || '自己紹介は未設定です。' }}</p>
    </div>
    <!-- v-if を追加。isLoggedInがtrueの時だけこのボタンを表示 -->
    <button v-if="isLoggedIn" @click="handleAttend" class="button-primary">このイベントに参加する</button>
  </div>
  <div v-else>
    <p>イベントを読み込んでいます...</p>
  </div>
</template>

<style scoped>
.event-detail { max-width: 800px; margin: 2rem auto; }
hr { margin: 1rem 0; }
.creator-profile {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>