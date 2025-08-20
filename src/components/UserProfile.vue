<!-- src/components/UserProfile.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const route = useRoute();
const userProfile = ref(null);

onMounted(async () => {
  // URLから、表示したいユーザーのIDを取得
  const userId = route.params.id;

  // 'users'コレクションから、そのIDと一致するプロフィールを探す
  const q = query(collection(db, "users"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    userProfile.value = querySnapshot.docs[0].data();
  }
});
</script>

<template>
  <div v-if="userProfile" class="user-profile-container card">
    <div class="profile-header">
      <div class="profile-avatar"></div>
      <h2 class="heading-main">{{ userProfile.nickname }}</h2>
    </div>
    <div class="profile-content">
      <p><strong>住所:</strong> {{ userProfile.address }}</p>
      <!-- 将来ここに自己紹介文などを追加 -->
    </div>
  </div>
  <div v-else>
    <p>ユーザー情報を読み込んでいます...</p>
  </div>
</template>

<style scoped>
.user-profile-container { max-width: 800px; margin: 2rem auto; }
.profile-header { display: flex; align-items: center; margin-bottom: 2rem; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; background-color: var(--color-secondary); margin-right: 1.5rem; }
.profile-header h2 { margin-bottom: 0; }
</style>