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
      <button type="submit" class="button-primary">ログイン</button>
    </form>
    <p class="signup-link">
      アカウントをお持ちでないですか？ <RouterLink to="/signup">新規登録</RouterLink>
    </p>
  </div>
</template>

<style scoped></style>