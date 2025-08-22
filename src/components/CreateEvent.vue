<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// ★ storage をインポートに追加
import { db, storage } from '../firebase'; 
// ★ Firebase Storage用の関数をインポート
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

const eventData = ref({
  title: '',
  description: '',
  eventDate: '',
  location: '',
  category: '',
});

const categories = ref([]);
// ★ アップロードする画像ファイルを保持するref
const imageFile = ref(null);
// ★ アップロード処理中かどうかを示すフラグ
const isUploading = ref(false);
// ★ プレビュー用の画像URLを保持するref
const imageUrlPreview = ref('');


// --- ★ ファイル選択時の処理 ---
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    imageFile.value = file;
    // 選択された画像をプレビュー表示
    imageUrlPreview.value = URL.createObjectURL(file);
  }
};


// --- ★ フォーム送信処理 (大幅に更新) ---
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
  if (!imageFile.value) {
    alert('イベント画像を選択してください。');
    return;
  }

  isUploading.value = true; // アップロード処理を開始
  let imageUrl = '';

  try {
    // --- 1. 画像をStorageにアップロード ---
    // ファイルパスを決定 (例: event-images/ユニークID.jpg)
    const filePath = `event-images/${auth.currentUser.uid}_${Date.now()}_${imageFile.value.name}`;
    const fileRef = storageRef(storage, filePath);
    
    // アップロードを実行
    await uploadBytes(fileRef, imageFile.value);
    
    // --- 2. アップロードした画像のURLを取得 ---
    imageUrl = await getDownloadURL(fileRef);
    
    // --- 3. 画像URLを含むイベント情報をFirestoreに保存 ---
    await addDoc(collection(db, 'events'), {
      ...eventData.value,
      imageUrl: imageUrl, // ★ 画像URLを追加
      eventDate: new Date(eventData.value.eventDate),
      organizerId: auth.currentUser.uid,
      createdAt: new Date()
    });

    console.log('Event created successfully with image');
    router.push('/events');

  } catch (error) {
    console.error('Error creating event:', error);
    alert('イベントの作成に失敗しました。');
  } finally {
    isUploading.value = false; // 処理が完了したらフラグを戻す
  }
};


// --- カテゴリ取得処理 (変更なし) ---
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
    <form @submit.prevent="createEvent">
      
      <!-- ★ ここから画像アップロードUIを追加 -->
      <div class="form-group">
        <label for="event-image">イベント画像</label>
        <input type="file" id="event-image" @change="handleFileChange" accept="image/*" required>
        <!-- 画像プレビュー -->
        <div v-if="imageUrlPreview" class="image-preview">
          <img :src="imageUrlPreview" alt="イベント画像プレビュー">
        </div>
      </div>
      <!-- ★ ここまで -->

      <div class="form-group">
        <label for="title">イベント名</label>
        <input type="text" id="title" v-model="eventData.title" required>
      </div>

      <!-- ... (他のフォーム項目は変更なし) ... -->
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

      <!-- ★ isUploading中はボタンを無効化する -->
      <button type="submit" :disabled="isUploading">
        {{ isUploading ? '作成中...' : '作成する' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
/* ... (既存のスタイルは変更なし) ... */

/* ★ 画像プレビュー用のスタイルを追加 */
.image-preview {
  margin-top: 1rem;
  max-width: 400px;
}
.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* ★ ボタンのdisabled時のスタイルを追加 */
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-container { max-width: 700px; margin: 2rem auto; padding: 2.5rem; background-color: #ffffff; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); }
h2 { text-align: left; margin-bottom: 2rem; color: #f0ad4e; font-size: 1.8rem; }
.form-group { margin-bottom: 1.5rem; }
label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; }
input[type="text"], input[type="datetime-local"], textarea, select, input[type="file"] { width: 100%; padding: 0.8rem 1rem; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
input[type="text"]:focus, input[type="datetime-local"]:focus, textarea:focus, select:focus, input[type="file"]:focus { outline: none; border-color: #f0ad4e; box-shadow: 0 0 0 3px rgba(240, 173, 78, 0.2); }
textarea { min-height: 150px; resize: vertical; }
button { padding: 0.8rem 1.8rem; background-color: #f0ad4e; color: white; border: none; border-radius: 5px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
button:hover { background-color: #ec971f; }
</style>