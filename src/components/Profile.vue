<!-- src/components/Profile.vue (最終完成版) -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const router = useRouter();

// ▼▼▼ 新しい項目に対応する「箱」を全て用意 ▼▼▼
const nickname = ref('');
const age = ref(null);
const gender = ref('');
const address = ref('');
const occupation = ref('');
const holiday = ref('');
const hobbies = ref('');
const introduction = ref('');

const user = auth.currentUser;
let userProfileDocId = null;

// --- 読み込み機能の強化 ---
onMounted(async () => {
  if (user) {
    const q = query(collection(db, "users"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userProfileDoc = querySnapshot.docs[0];
      userProfileDocId = userProfileDoc.id;
      const profileData = userProfileDoc.data();
      
      // ▼▼▼ 全ての項目を読み込むようにする ▼▼▼
      nickname.value = profileData.nickname || '';
      age.value = profileData.age || null;
      gender.value = profileData.gender || '';
      address.value = profileData.address || '';
      occupation.value = profileData.occupation || '';
      holiday.value = profileData.holiday || '';
      hobbies.value = profileData.hobbies || '';
      introduction.value = profileData.introduction || '';
    }
  }
});

// --- 保存・更新機能の強化 ---
const handleSaveProfile = async () => {
  if (!user) { return; }

  // ▼▼▼ 全ての項目を保存データに含める ▼▼▼
  const profileData = {
    userId: user.uid,
    nickname: nickname.value,
    age: age.value,
    gender: gender.value,
    address: address.value,
    occupation: occupation.value,
    holiday: holiday.value,
    hobbies: hobbies.value,
    introduction: introduction.value,
  };

  try {
    if (userProfileDocId) {
      await updateDoc(doc(db, "users", userProfileDocId), profileData);
    } else {
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
    <h2>プロフィール編集</h2>
    <form @submit.prevent="handleSaveProfile">
      <!-- 名前（ニックネーム） -->
      <div class="form-group">
        <label for="nickname">名前（ニックネーム）</label>
        <input type="text" id="nickname" v-model="nickname" required />
      </div>
      <!-- 年齢 -->
      <div class="form-group">
        <label for="age">年齢</label>
        <input type="number" id="age" v-model="age" />
      </div>
      <!-- 性別 -->
      <div class="form-group">
        <label for="gender">性別</label>
        <select id="gender" v-model="gender">
          <option value="">選択しない</option>
          <option value="男性">男性</option>
          <option value="女性">女性</option>
          <option value="その他">その他</option>
        </select>
      </div>
      <!-- 住所 -->
      <div class="form-group">
        <label for="address">住所</label>
        <input type="text" id="address" v-model="address" />
      </div>
      <!-- 仕事 -->
      <div class="form-group">
        <label for="occupation">仕事</label>
        <input type="text" id="occupation" v-model="occupation" />
      </div>
      <!-- 休日 -->
      <div class="form-group">
        <label for="holiday">休日</label>
        <select id="holiday" v-model="holiday">
          <option value="">選択しない</option>
          <option value="平日休み">平日休み</option>
          <option value="土日休み">土日休み</option>
          <option value="不定期">不定期</option>
        </select>
      </div>
      <!-- 趣味 -->
      <div class="form-group">
        <label for="hobbies">趣味（カンマ区切り）</label>
        <input type="text" id="hobbies" v-model="hobbies" />
      </div>
      <!-- 自己紹介文 -->
      <div class="form-group">
        <label for="introduction">自己紹介文（500文字以内）</label>
        <textarea id="introduction" v-model="introduction" rows="7" maxlength="500"></textarea>
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