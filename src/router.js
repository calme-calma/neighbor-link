import { createRouter, createWebHistory } from 'vue-router'

// --- パスをすべて「./components/」に修正 ---
import EventsList from './components/EventsList.vue'
import Login from './components/Login.vue'
import SignUp from './components/SignUp.vue'
import CreateEvent from './components/CreateEvent.vue'
import MyPage from './components/MyPage.vue'
import EventDetail from './components/EventDetail.vue'
import Profile from './components/Profile.vue'

// authStoreをインポート
import { useAuthStore } from './stores/authStore'

const routes = [
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
  { path: '/', redirect: '/events' },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/events', component: EventsList },
  { path: '/event/:id', component: EventDetail, name: 'EventDetail' },
  { path: '/mypage', component: MyPage, meta: { requiresAuth: true } },
  { path: '/create-event', component: CreateEvent, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


// ナビゲーションガード
router.beforeEach(async (to, from, next) => {
  // authStoreをここで初期化
  const authStore = useAuthStore();

  // Firebaseの認証状態の初期チェックが完了するまで待つ
  await authStore.waitForAuth();

  const requiresAuth = to.meta.requiresAuth;
  const isLoggedIn = authStore.isLoggedIn;

  if (requiresAuth && !isLoggedIn) {
    // ログインが必要なページに、未ログインの状態でアクセスした場合
    // -> ログインページにリダイレクト
    next('/login');
  } else if ((to.path === '/login' || to.path === '/signup') && isLoggedIn) {
    // ログイン済みのユーザーがログインページやサインアップページにアクセスした場合
    // -> イベント一覧ページにリダイレクト
    next('/events');
  } else {
    // それ以外の場合（アクセスを許可する場合）
    next();
  }
});


export default router