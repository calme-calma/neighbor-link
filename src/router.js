// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import SignUp from './components/SignUp.vue';
import Profile from './components/Profile.vue';
import EventsList from './components/EventsList.vue'; // 追加
import EventDetail from './components/EventDetail.vue'; // 追加

const routes = [
  { path: '/signup', component: SignUp },
  { path: '/profile', component: Profile },
  { path: '/events', component: EventsList },       // 追加
  { path: '/event/:id', component: EventDetail },   // 追加 (:idはどんな文字でもOKという意味)
  { path: '/', redirect: '/events' }, // 最初に表示するページを/eventsに変更
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;