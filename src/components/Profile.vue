<!-- src/components/Profile.vue (最終完成版) -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const nickname = ref('');
const address = ref('');

const user = auth.currentUser;
let userProfileDocId = null; // 既存のプロフィールデータのIDを保存する変数

// --- 読み込み機能 ---
onMounted(async () => {
  if (user) {
    // 'users'コレクションから、自分のuserIdと一致するプロフィールを探す
    const q = query(collection(db, "users"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    // もしプロフィールが見つかれば
    if (!querySnapshot.empty) {
      const userProfileDoc = querySnapshot.docs[0];
      userProfileDocId = userProfileDoc.id; // ドキュメントIDを保存
      const profileData = userProfileDoc.data();
      nickname.value = profileData.nickname; // ニックネームを入力欄に表示
      address.value = profileData.address;   // 住所を入力欄に表示
    }
  }
});

// --- 保存・更新機能 ---
const handleSaveProfile = async () => {
  if (!user) {
    alert('ログインしていません。');
    return;
  }

  const profileData = {
    userId: user.uid,
    nickname: nickname.value,
    address: address.value,
  };

  try {
    // もし、既存のプロフィールIDが保存されていれば「更新」
    if (userProfileDocId) {
      const docRef = doc(db, "users", userProfileDocId);
      await updateDoc(docRef, profileData);
    } 
    // もし、既存のプロフィールIDがなければ「新規作成」
    else {
      // 注意：新規登録直後にここに来る場合、setDocの方が安全
      // ここでは話を簡単にするために、新規追加(addDoc)の代わりにsetDocを使います
      // 自分のユーザーIDをドキュメントIDにすることで、重複を防ぎます
      await setDoc(doc(db, "users", user.uid), profileData);
    }
    
    alert('プロフィールを保存しました！');
    router.push('/events');

  } catch (error) {
    console.error("プロフィール保存エラー: ", error);
    alert('エラーが発生しました。');
  }
};
</script>

<template>
  <div class="card">
    <h2>プロフィール編集</h2> <!-- タイトルも変更 -->
    <form @submit.prevent="handleSaveProfile">
      <div class="form-group">
        <label for="nickname">ニックネーム</label>
        <input type="text" id="nickname" v-model="nickname" required />
      </div>
      <div class="form-group">
        <label for="address">住所</label>
        <input type="text" id="address" v-model="address" required />
      </div>
      <button type="submit">保存する</button>
    </form>
  </div>
</template>

<style scoped>
/* スタイルは変更なし */
.card { max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; }
input { width: 100%; padding: 0.5rem; }
button { width: 100%; padding: 0.75rem; background-color: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>