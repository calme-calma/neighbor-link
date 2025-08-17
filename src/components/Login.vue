<!-- src/components/Login.vue -->
<script setup>
import { ref } from 'vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter, RouterLink } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = () => {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      // ログイン成功後、イベント一覧ページに移動
      router.push('/events');
    })
    .catch((error) => {
      alert('メールアドレスまたはパスワードが違います。');
      console.error(error);
    });
};
</script>

<template>
  <div class="card">
    <h2>ログイン</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">メールアドレス</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">パスワード</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">ログイン</button>
    </form>
    <p class="signup-link">
      アカウントをお持ちでないですか？ <RouterLink to="/signup">新規登録</RouterLink>
    </p>
  </div>
</template>

<style scoped>
/* SignUp.vueとほぼ同じスタイル */
.card { max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.5rem; }
input { width: 100%; padding: 0.5rem; }
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
.signup-link { text-align: center; margin-top: 1rem; }
</style>