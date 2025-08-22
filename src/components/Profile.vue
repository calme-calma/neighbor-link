<script setup>
import { ref, onMounted } from 'vue';
import { db, storage, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// ★ 扱うデータモデルを大幅に拡張
const profile = ref({
  // 基本情報
  iconUrl: '',
  name: '',
  nickname: '',
  bio: '',
  // 詳細情報
  birthday: '',
  station: '',
  address: '',
  job: '',
  holiday: '',
  // 興味・関心 (配列で管理)
  interests: [] 
});

// ★ 興味・関心の選択肢リスト
const interestOptions = [
  'アウトドア・キャンプ', '料理・お菓子作り', '読書・本', 'スポーツ観戦', 'アート・美術館巡り', '語学学習', 'ボードゲーム',
  '旅行 (国内・海外)', '映画鑑賞', 'アニメ・漫画', 'ランニング・筋トレ', '写真・カメラ', '投資・資産運用', '動物・ペット',
  '食べ歩き・カフェ巡り', '音楽鑑賞・ライブ', 'ゲーム', 'ヨガ・ピラティス', 'ハンドメイド・DIY', 'プログラミング・IT'
];

const newIconFile = ref(null);
const iconPreviewUrl = ref('');
const isLoading = ref(true);
const isUpdating = ref(false);
let userDocRef = null;

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      // ★ Firestoreから読み込んだデータと、ローカルのデータモデルをマージする
      profile.value = { ...profile.value, ...docSnap.data() };
      iconPreviewUrl.value = profile.value.iconUrl || '';
    }
  }
  isLoading.value = false;
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    newIconFile.value = file;
    iconPreviewUrl.value = URL.createObjectURL(file);
  }
};

const updateProfile = async () => {
  if (!userDocRef) return;

  isUpdating.value = true;
  let updatedIconUrl = profile.value.iconUrl;

  try {
    if (newIconFile.value) {
      const filePath = `profile-icons/${auth.currentUser.uid}/${Date.now()}`;
      const fileRef = storageRef(storage, filePath);
      await uploadBytes(fileRef, newIconFile.value);
      updatedIconUrl = await getDownloadURL(fileRef);
    }
    
    // ★ 保存するデータを現在のprofile refの内容に更新
    const profileData = {
      ...profile.value,
      userId: auth.currentUser.uid,
      iconUrl: updatedIconUrl
    };
    
    await setDoc(userDocRef, profileData, { merge: true }); // ★ merge:trueで、既存フィールドを消さずに更新
    
    alert('プロフィールを更新しました！');
  } catch (error) {
    console.error("Error updating profile: ", error);
    alert('プロフィールの更新に失敗しました。');
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <div v-if="isLoading">...</div>
  <div v-else class="profile-container">
    <form @submit.prevent="updateProfile">
      <h1>プロフィール編集</h1>
      
      <!-- アイコン -->
      <div class="form-section">
        <label>プロフィールアイコン</label>
        <div class="icon-preview"><img :src="iconPreviewUrl || '/symbol-logo.png'"></div>
        <input type="file" @change="handleFileChange">
      </div>

      <!-- 基本情報 -->
      <div class="form-section">
        <div class="form-group"><label for="name">名前</label><input type="text" id="name" v-model="profile.name"></div>
        <div class="form-group"><label for="nickname">ニックネーム</label><input type="text" id="nickname" v-model="profile.nickname"></div>
        <div class="form-group"><label for="birthday">生年月日</label><input type="date" id="birthday" v-model="profile.birthday"></div>
        <div class="form-group"><label for="station">最寄り駅</label><input type="text" id="station" v-model="profile.station"></div>
        <div class="form-group"><label for="address">住所</label><input type="text" id="address" v-model="profile.address"></div>
        <div class="form-group"><label for="job">仕事</label><input type="text" id="job" v-model="profile.job"></div>
        <div class="form-group"><label for="holiday">休日</label><select id="holiday" v-model="profile.holiday"><option>土日休み</option><option>平日休み</option><option>不定休</option></select></div>
      </div>
      
      <!-- 興味のあること -->
      <div class="form-section">
        <label>興味のあること</label>
        <div class="interests-grid">
          <div v-for="interest in interestOptions" :key="interest" class="interest-item">
            <input type="checkbox" :id="interest" :value="interest" v-model="profile.interests">
            <label :for="interest">{{ interest }}</label>
          </div>
        </div>
      </div>
      
      <!-- 自己紹介 -->
      <div class="form-section">
        <div class="form-group">
          <label for="bio">自己紹介文</label>
          <textarea id="bio" v-model="profile.bio" rows="8"></textarea>
        </div>
      </div>
      
      <button type="submit" :disabled="isUpdating">{{ isUpdating ? '保存中...' : '保存する' }}</button>
    </form>
  </div>
</template>

<style scoped>
.profile-container { max-width: 900px; margin: 2rem auto; padding: 2.5rem; background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
h1 { margin-bottom: 2rem; }
.form-section { margin-bottom: 2.5rem; }
.form-group { margin-bottom: 1.5rem; }
label { display: block; font-weight: 600; margin-bottom: 0.5rem; }
input[type="text"], input[type="date"], select, textarea { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.icon-preview { width: 120px; height: 120px; border-radius: 50%; overflow: hidden; margin-bottom: 1rem; border: 3px solid #f0ad4e; }
.icon-preview img { width: 100%; height: 100%; object-fit: cover; }
.interests-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.interest-item { display: flex; align-items: center; }
.interest-item input { margin-right: 0.5rem; }
button { /* 以前のスタイルを適用 */ }
</style>