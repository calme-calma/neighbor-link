<!-- src/components/Profile.vue (最終完成版) -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const router = useRouter();

// ▼▼▼ 新しい項目に対応する「箱」を全て用意 ▼▼▼
const name = ref('');
const nickname = ref('');
const birthdate = ref('');
const station = ref('');
const interests = ref([]); // ★複数選択なので配列
const age = ref(null); // 年齢は削除しましたが、他の場所で使う可能性を考え残してもOK
const gender = ref('');
const address = ref(''); // 住所は残します
const occupation = ref('');
const holiday = ref('');
const hobbies = ref(''); // 趣味はinterestsに統合されますが、一旦残します
const introduction = ref('');

// ▼▼▼「興味のあること」の選択肢リスト ▼▼▼
const interestOptions = [
  'アウトドア・キャンプ', '旅行（国内・海外）', '食べ歩き・カフェ巡り', '料理・お菓子作り',
  '映画鑑賞', '音楽鑑賞・ライブ', '読書・本', 'アニメ・漫画',
  'ゲーム', 'スポーツ観戦', 'ランニング・筋トレ', 'ヨガ・ピラティス',
  'アート・美術館巡り', '写真・カメラ', 'ハンドメイド・DIY', '語学学習',
  '投資・資産運用', 'プログラミング・IT', 'ボードゲーム', '動物・ペット'
];

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
      name.value = profileData.name || '';
      nickname.value = profileData.nickname || '';
      birthdate.value = profileData.birthdate || '';
      station.value = profileData.station || '';

      // ★配列であるinterestsも読み込む
      interests.value = profileData.interests || []; 
      
      // 既存の項目も読み込む
      age.value = profileData.age || null;
      gender.value = profileData.gender || '';
      address.value = profileData.address || '';
      occupation.value = profileData.occupation || '';
      holiday.value = profileData.holiday || '';
      hobbies.value = profileData.hobbies || ''; // 古い趣味データも念のため読み込み
      introduction.value = profileData.introduction || '';
    }
  }
});

// --- 保存・更新機能の強化 ---
const handleSaveProfile = async () => {
  if (!user) { return; }

  const profileData = {
    userId: user.uid,
    // ▼▼▼ 新しい項目を保存データに含める ▼▼▼
    name: name.value,
    nickname: nickname.value,
    birthdate: birthdate.value,
    station: station.value,
    interests: interests.value, // ★配列をそのまま保存
    
    // 既存の項目
    age: age.value,
    gender: gender.value,
    address: address.value,
    occupation: occupation.value,
    holiday: holiday.value,
    hobbies: hobbies.value,
    introduction: introduction.value,
  };

  try {
    // ... 更新・新規作成ロジックは変更なし ...
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
      <!-- 名前 -->
      <div class="form-group">
        <label for="name">名前</label>
        <input type="text" id="name" v-model="name" />
      </div>
      <!-- ニックネーム -->
      <div class="form-group">
        <label for="nickname">ニックネーム</label>
        <input type="text" id="nickname" v-model="nickname" required />
      </div>
      <!-- 生年月日 -->
      <div class="form-group">
        <label for="birthdate">生年月日</label>
        <input type="date" id="birthdate" v-model="birthdate" />
      </div>
      <!-- 最寄り駅 -->
      <div class="form-group">
        <label for="station">最寄り駅</label>
        <input type="text" id="station" v-model="station" />
      </div>
      <!-- 興味のあること（複数選択） -->
      <div class="form-group">
        <label>興味のあること</label>
        <div class="interest-options">
          <div v-for="option in interestOptions" :key="option" class="interest-item">
            <input type="checkbox" :id="option" :value="option" v-model="interests">
            <label :for="option">{{ option }}</label>
          </div>
        </div>
      </div>
      <!-- 既存の項目（住所、仕事など） -->
      <div class="form-group">
        <label for="address">住所</label>
        <input type="text" id="address" v-model="address" />
      </div>
      <div class="form-group">
        <label for="occupation">仕事</label>
        <input type="text" id="occupation" v-model="occupation" />
      </div>
      <div class="form-group">
        <label for="holiday">休日</label>
        <select id="holiday" v-model="holiday">
          <option value="">選択しない</option>
          <option value="平日休み">平日休み</option>
          <option value="土日休み">土日休み</option>
          <option value="不定期">不定期</option>
        </select>
      </div>
      <div class="form-group">
        <label for="introduction">自己紹介文（500文字以内）</label>
        <textarea id="introduction" v-model="introduction" rows="7" maxlength="500"></textarea>
      </div>

      <button type="submit" class="button-primary">保存する</button>
    </form>
  </div>
</template>

<style scoped>
/* チェックボックス用のスタイルを追加 */
.interest-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* スマホでは2列 */
  gap: 0.5rem;
}
.interest-item {
  display: flex;
  align-items: center;
}
.interest-item input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

/* PC表示では3列に */
@media (min-width: 768px) {
  .interest-options {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>