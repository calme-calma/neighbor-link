<!-- src/components/SignUp.vue -->
<script setup>
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const handleSignUp = () => {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // 登録成功！
      console.log('登録に成功しました！', userCredential.user);
      alert('アカウント登録が完了しました！');
      router.push('/events'); //新規登録直後に、イベント一覧が見える
    })
    .catch((error) => {
      // 登録失敗…
      console.error('登録エラー:', error.message);
      alert('エラー: ' + error.message);
    });
};
</script>

<template>
  <div class="card">
    <h2>新規アカウント登録</h2>
    <form @submit.prevent="handleSignUp">
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">パスワード</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">登録する</button>
    </form>
  </div>
</template>

<style scoped>
.card {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--accent-color); /* ← 黄色に変更 */
  color: var(--text-color);           /* ← ダークグレーに変更 */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;                   /* ← 太字を追記 */
}
</style>