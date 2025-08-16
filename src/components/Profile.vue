<!-- src/components/Profile.vue -->
<script setup>
import { ref } from 'vue';
import { db, auth } from '../firebase'; // 設定ファイルをインポート
import { collection, addDoc } from 'firebase/firestore';

const nickname = ref('');
const address = ref('');

const handleSaveProfile = async () => {
  // 現在ログインしているユーザーの情報を取得
  const user = auth.currentUser;
  if (!user) {
    alert('ログインしていません。');
    return;
  }

  try {
    // 'users'コレクションに新しいドキュメントを追加
    await addDoc(collection(db, "users"), {
      userId: user.uid, // これがユーザーとプロフィールを繋ぐ鍵！
      nickname: nickname.value,
      address: address.value,
    });
    alert('プロフィールを保存しました！');
  } catch (error) {
    console.error("プロフィール保存エラー: ", error);
    alert('エラーが発生しました。');
  }
};
</script>

<template>
  <div class="card">
    <h2>プロフィール情報入力</h2>
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
/* SignUp.vueと同じスタイルを再利用 */
.card { max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; }
input { width: 100%; padding: 0.5rem; }
button { width: 100%; padding: 0.75rem; background-color: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>