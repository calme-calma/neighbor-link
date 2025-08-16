// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import SignUp from './components/SignUp.vue';
import Profile from './components/Profile.vue';

const routes = [
  { path: '/signup', component: SignUp },
  { path: '/profile', component: Profile },
  // 最初は/signupに飛ばす
  { path: '/', redirect: '/signup' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;