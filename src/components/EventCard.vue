<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

const formattedDate = computed(() => {
  if (!props.event.eventDate || typeof props.event.eventDate.toDate !== 'function') {
    return '日時未定';
  }
  const date = props.event.eventDate.toDate();
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script>

<template>
  <RouterLink :to="{ name: 'EventDetail', params: { id: event.id } }" class="event-card">
    
    <!-- ★ ここから画像表示エリアを修正 -->
    <div class="card-image">
      <!-- v-ifでimageUrlが存在する場合のみimgタグを表示 -->
      <img v-if="event.imageUrl" :src="event.imageUrl" alt="イベント画像">
      <!-- imageUrlがない場合は、これまで通りの背景色が表示される -->
    </div>
    <!-- ★ ここまで修正 -->

    <div class="card-content">
      <h3>{{ event.title }}</h3>
      <div class="event-info">
        <span class="info-item date">
          <i class="icon-calendar"></i>
          {{ formattedDate }}
        </span>
        <span class="info-item location">
          <i class="icon-location"></i>
          {{ event.location }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.event-card {
  display: block;
  min-width: 280px;
  max-width: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
  height: 150px;
  background-color: #e0f7fa;
  /* ★ 画像を綺麗に表示するためのスタイルを追加 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* ★ アスペクト比を保ったままエリアを埋める */
}

/* ... (以降のスタイルは変更なし) ... */
.card-content { padding: 1rem; }
h3 { font-size: 1.2rem; font-weight: bold; margin: 0 0 0.75rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-info { font-size: 0.9rem; color: #666; }
.info-item { display: flex; align-items: center; margin-bottom: 0.5rem; }
.info-item i { margin-right: 0.5rem; }
.icon-calendar::before { content: '📅'; }
.icon-location::before { content: '📍'; }
</style>