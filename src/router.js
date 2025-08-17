// src/router.js (改善版)
import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Login from './components/Login.vue';
import SignUp from './components/SignUp.vue';
import Profile from './components/Profile.vue';
import EventsList from './components/EventsList.vue';
import EventDetail from './components/EventDetail.vue';
import MyPage from './components/MyPage.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
  { path: '/', redirect: '/events' },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/events', component: EventsList },
  { path: '/event/:id', component: EventDetail },
  { path: '/mypage', component: MyPage, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ▼▼▼ 新しい「賢い門番」のロジック ▼▼▼

// この関数は、Firebaseの初期認証が終わるのを待つ
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth; // 行き先は認証が必要か？
  const user = getAuth().currentUser; // 現在のユーザー情報は？

  // 認証が必要なページに、まだログインしていないユーザーがアクセスしようとした場合
  if (requiresAuth && !user) {
    // Firebaseの初期化が終わるのを待ってから、もう一度判断する
    // これにより、ページリロード時にも正しくログイン状態を判定できる
    if (await getCurrentUser()) {
      next(); // 待った結果、ログインしていたので通す
    } else {
      alert('このページを見るにはログインが必要です。');
      next('/login'); // 待ってもログインしていなかったので、ログインページへ
    }
  } else {
    // 認証が不要なページ、または既にログインしている場合は、そのまま通す
    next();
  }
});

export default router;