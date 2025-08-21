<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

// ★ 入力データはこの eventData に一括で管理
const eventData = ref({
  title: '',
  description: '',
  eventDate: '',
  location: '',
  category: ''
});

const categories = ref([]);

// ★ 関数名は createEvent に統一
const createEvent = async () => {
  if (!auth.currentUser) {
    alert('ログインが必要です。');
    router.push('/login');
    return;
  }
  if (!eventData.value.category) {
    alert('カテゴリを選択してください。');
    return;
  }
  try {
    // ★ 保存するデータも eventData.value を使う
    await addDoc(collection(db, 'events'), {
      ...eventData.value,
      eventDate: new Date(eventData.value.eventDate), 
      organizerId: auth.currentUser.uid,
      createdAt: new Date()
    });
    console.log('Event created successfully');
    alert('新しいイベントを作成しました！');
    router.push('/events');
  } catch (error) {
    console.error('Error creating event:', error);
    alert('イベントの作成に失敗しました。');
  }
};

onMounted(async () => {
  try {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('order'));
    const querySnapshot = await getDocs(q);
    categories.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      slug: doc.data().slug,
      name: doc.data().name
    }));
    if (categories.value.length > 0) {
      eventData.value.category = '';
    }
  } catch (error) {
    console.error("Error fetching categories: ", error);
  }
});
</script>

<template>
  <div class="form-container">
    <h2>新しいイベントを作成</h2>
    <!-- ★ 呼び出す関数名も createEvent に統一 -->
    <form @submit.prevent="createEvent">
      
      <div class="form-group">
        <label for="title">イベント名</label>
        <!-- ★ v-model も eventData.title のように修正 -->
        <input type="text" id="title" v-model="eventData.title" required>
      </div>

      <div class="form-group">
        <label for="description">イベント詳細</label>
        <textarea id="description" v-model="eventData.description" required></textarea>
      </div>

      <div class="form-group">
        <label for="location">開催場所</label>
        <input type="text" id="location" v-model="eventData.location" required>
      </div>
      
      <div class="form-group">
        <label for="eventDate">開催日時</label>
        <input type="datetime-local" id="eventDate" v-model="eventData.eventDate" required>
      </div>
      
      <div class="form-group">
        <label for="category">カテゴリ</label>
        <select id="category" v-model="eventData.category" required>
          <option disabled value="">選択してください</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <button type="submit">作成する</button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}
h2 {
  text-align: left;
  margin-bottom: 2rem;
  color: #f0ad4e;
  font-size: 1.8rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}
input[type="text"],
input[type="datetime-local"],
textarea,
select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input[type="text"]:focus,
input[type="datetime-local"]:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #f0ad4e;
  box-shadow: 0 0 0 3px rgba(240, 173, 78, 0.2);
}
textarea {
  min-height: 150px;
  resize: vertical;
}
button {
  padding: 0.8rem 1.8rem;
  background-color: #f0ad4e;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #ec971f;
}
</style>