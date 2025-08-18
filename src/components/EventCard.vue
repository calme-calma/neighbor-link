<!-- src/components/EventCard.vue -->
<script setup>
// このコンポーネントは、'event'という名前のデータを受け取ることを定義します
defineProps({
  event: Object
});
</script>

<template>
  <div class="event-card card">
    <!-- 仕様書通り、上半分は写真エリア（今はプレースホルダー） -->
    <div class="event-card-image">
      <!-- 将来ここに <img /> が入ります -->
    </div>
    
    <!-- 下半分は情報エリア -->
    <div class="event-card-content">
      <h3>{{ event.title }}</h3>
      <p class="event-date">🗓️ {{ event.eventDate }}</p>
      <p class="event-location">📍 {{ event.location }}</p>
      <!-- 将来ここに主催者情報やハートマークが入ります -->
    </div>
  </div>
</template>

<style scoped>
.event-card {
  padding: 0; /* カードの余白をリセット */
  overflow: hidden; /* 角丸からはみ出ないように */
  transition: transform 0.2s, box-shadow 0.2s;
}
.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.event-card-image {
  height: 150px;
  background-color: var(--color-secondary); /* サブカラーで仮表示 */
  /* 将来的には background-image を使います */
}

.event-card-content {
  padding: 1.5rem;
}

h3 {
  font-family: 'M PLUS Rounded 1c', sans-serif;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.event-date, .event-location {
  margin: 0.5rem 0;
  color: #666;
}
</style>