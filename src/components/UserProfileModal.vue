<script setup>
import { ref, watch } from 'vue';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// ★ 親コンポーネントから受け取るデータ (Props) を定義
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    default: null,
  }
});

// ★ 親コンポーネントに通知するイベント (Emit) を定義
const emit = defineEmits(['close']);

const profile = ref(null);
const isLoading = ref(false);

// ★ isVisibleプロパティの変更を監視する
watch(() => props.isVisible, (newValue) => {
  // モーダルが表示されるとき (isVisibleがtrueになったとき)
  if (newValue && props.userId) {
    fetchUserProfile();
  } else {
    // モーダルが閉じるときは、データをリセット
    profile.value = null;
  }
});

// ★ Firestoreからプロフィール情報を取得する関数
const fetchUserProfile = async () => {
  isLoading.value = true;
  try {
    const userDocRef = doc(db, 'users', props.userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      profile.value = docSnap.data();
    } else {
      console.log("No such profile document!");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <!-- ★ isVisibleがtrueの時だけモーダル全体が表示される -->
  <div v-if="isVisible" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <!-- 閉じるボタン -->
      <button @click="emit('close')" class="close-button">&times;</button>

      <!-- ローディング表示 -->
      <div v-if="isLoading" class="loading-spinner"></div>
      
      <!-- プロフィール情報 -->
      <div v-else-if="profile">
        <div class="profile-header">
          <img :src="profile.iconUrl || '/symbol-logo.png'" class="profile-icon">
          <h2>{{ profile.name || '名前未設定' }}</h2>
          <p class="nickname">@{{ profile.nickname || 'ニックネーム未設定' }}</p>
        </div>

        <div class="profile-body">
          <section class="details-grid">
            <div>
              <h3>ニックネーム</h3>
              <p>{{ profile.nickname || '-' }}</p>
            </div>
            <div>
              <h3>生年月日</h3>
              <p>{{ profile.birthday || '-' }}</p>
            </div>
            <div>
              <h3>仕事</h3>
              <p>{{ profile.job || '-' }}</p>
            </div>
          </section>

          <section>
            <h3>自己紹介</h3>
            <p>{{ profile.bio || '自己紹介がありません' }}</p>
          </section>

          <section v-if="profile.interests && profile.interests.length > 0">
            <h3>興味・関心</h3>
            <div class="interests-container">
              <span v-for="interest in profile.interests" :key="interest" class="interest-tag">
                {{ interest }}
              </span>
            </div>
          </section>
        </div>
      </div>
      
      <!-- データがない場合 -->
      <div v-else>
        <p>プロフィール情報を取得できませんでした。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ★★★ モーダル専用のスタイル ★★★ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.4s ease-out;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #aaa;
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0ad4e;
  margin-bottom: 1rem;
}

h2 { margin: 0; }
.nickname { color: #777; margin-top: 0.5rem; }

section {
  margin-bottom: 1.5rem;
}
section h3 {
  border-bottom: 2px solid #f0ad4e;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.interests-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.interest-tag {
  background-color: #f5f5f5;
  padding: 0.3rem 0.8rem;
  border-radius: 99px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.details-grid h3 {
  border-bottom: none;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #777;
}
.details-grid p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

/* アニメーション */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>