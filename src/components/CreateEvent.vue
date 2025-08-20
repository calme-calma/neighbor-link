<!-- src/components/CreateEvent.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const router = useRouter();
const title = ref('');
const description = ref('');
const location = ref('');
const eventDate = ref('');

const handleCreateEvent = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('イベントを作成するにはログインが必要です。');
    return;
  }

  // フォームが空でないか簡単なチェック
  if (!title.value || !description.value || !location.value || !eventDate.value) {
    alert('すべての項目を入力してください。');
    return;
  }

  try {
    // 'events'コレクションに新しいドキュメントを追加
    await addDoc(collection(db, "events"), {
      title: title.value,
      description: description.value,
      location: location.value,
      eventDate: eventDate.value,
      organizerId: user.uid, // ★★★ 名前を organizerId に統一！ ★★★
      createdAt: serverTimestamp() // 作成日時
    });

    alert('新しいイベントを作成しました！');
    router.push('/events'); // 作成後、イベント一覧に移動

  } catch (error) {
    console.error("イベント作成エラー: ", error);
    alert('エラーが発生しました。');
  }
};
</script>

<template>
  <div class="card">
    <h2 class="heading-main">新しいイベントを作成</h2> 
      <form @submit.prevent="handleCreateEvent">
        <div class="form-group">
          <label for="title">イベント名</label>
          <input type="text" id="title" v-model="title" required />
        </div>

        <div class="form-group">
          <label for="description">イベント詳細</label>
          <textarea id="description" v-model="description" rows="5" required></textarea>
        </div>

        <div class="form-group">
          <label for="location">開催場所</label>
          <input type="text" id="location" v-model="location" required />
        </div>

        <div class="form-group">
          <label for="eventDate">開催日時</label>
          <input type="datetime-local" id="eventDate" v-model="eventDate" required />
        </div>

        <button type="submit" class="button button-primary">作成する</button>
      </form>
  </div>
</template>

<style scoped></style>