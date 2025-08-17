<!-- src/components/EventDetail.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute(); // URLの情報を取得するための道具
const event = ref(null); // 取得した単一のイベントを保存する「箱」
const eventId = route.params.id; // eventIdをここで定義しておくと便利
const isLoggedIn = ref(false); // ← ログイン状態を入れる箱
const auth = getAuth();

onAuthStateChanged(auth, (user) => { // ← ログイン状態を監視
  isLoggedIn.value = !!user;
});

// 「参加する」ボタンが押されたときの処理
const handleAttend = async () => {
  const user = auth.currentUser; // 現在ログインしているユーザーを取得
  if (!user) {
    alert('参加するにはログインが必要です。');
    return;
  }

  try {
    // 'attendances'コレクションに新しいドキュメント（参加記録）を追加
    await addDoc(collection(db, "attendances"), {
      userId: user.uid,         // 誰が
      eventId: eventId,         // どのイベントに
      createdAt: serverTimestamp() // いつ参加したか
    });
    alert('イベントへの参加登録が完了しました！');
  } catch (error) {
    console.error("参加登録エラー: ", error);
    alert('エラーが発生しました。');
  }
};

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
    <!-- v-if を追加。isLoggedInがtrueの時だけこのボタンを表示 -->
    <button v-if="isLoggedIn" @click="handleAttend">このイベントに参加する</button>
  </div>
  <div v-else>
    <p>イベントを読み込んでいます...</p>
  </div>
</template>

<style scoped>
.event-detail { max-width: 800px; margin: 2rem auto; }
hr { margin: 1rem 0; }
</style>