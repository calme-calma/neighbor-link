<!-- src/components/SplashScreen.vue -->
<script setup>
import logo from '../assets/symbol-logo.png';
</script>

<template>
  <div class="splash-screen">
    <div class="logo-container">
      <img :src="logo" alt="Neighbor Link Logo" class="splash-logo" />
      <span class="splash-service-name">Neighbor Link</span>
    </div>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100; /* 全てのコンテンツの最前面に表示 */
}

.logo-container {
  display: flex;
  align-items: center;
  /* アニメーションの準備 */
  opacity: 1;
  transform: scale(1);
}

.splash-logo {
  height: 60px; /* 少し大きめのロゴ */
  margin-right: 1rem;
}

.splash-service-name {
  font-family: 'M PLUS Rounded 1c', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
}
</style>