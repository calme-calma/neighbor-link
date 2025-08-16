<!-- src/App.vue -->
<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/events">イベント一覧</RouterLink>
      <RouterLink to="/mypage">マイページ</RouterLink> <!-- マイページはまだ作りませんが、リンクだけ用意 -->
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style>
/* 全体に適用される基本スタイル */
body { font-family: sans-serif; margin: 0; }
main { padding: 1rem; }
header { background-color: #f8f8f8; padding: 1rem; border-bottom: 1px solid #ddd; }
nav a { margin-right: 1rem; text-decoration: none; color: #42b983; }
</style>