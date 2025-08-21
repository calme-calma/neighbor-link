<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

// 親コンポーネント(EventsList)からeventオブジェクトを受け取る
const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

// ★ タイムスタンプを人間が読める形式にフォーマットする computed プロパティ
const formattedDate = computed(() => {
  if (!props.event.eventDate || typeof props.event.eventDate.toDate !== 'function') {
    return '日時未定';
  }
  const date = props.event.eventDate.toDate();
  // 日本のロケールで、年/月/日 時:分 の形式に変換
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
  <!-- ★ RouterLinkでカード全体を囲む -->
  <RouterLink :to="{ name: 'EventDetail', params: { id: event.id } }" class="event-card">
    <div class="card-image">
      <!-- 将来的にここにイベント画像を表示できます -->
    </div>
    <div class="card-content">
      <h3>{{ event.title }}</h3>
      <div class="event-info">
        <span class="info-item date">
          <i class="icon-calendar"></i> <!-- アイコンは後で追加可能 -->
          {{ formattedDate }} <!-- ★ フォーマットされた日付を表示 -->
        </span>
        <span class="info-item location">
          <i class="icon-location"></i> <!-- アイコンは後で追加可能 -->
          {{ event.location }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
/* ★ スタイルも全体的に見やすく修正 */
.event-card {
  display: block;
  min-width: 280px; /* カードの最小幅 */
  max-width: 280px; /* カードの最大幅 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  text-decoration: none; /* リンクの下線を消す */
  color: inherit; /* リンクの色を親要素から継承 */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
  height: 150px;
  background-color: #e0f7fa; /* 画像がない場合の仮の背景色 */
}

.card-content {
  padding: 1rem;
}

h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.75rem 0;
  /* 長いタイトルのための設定 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-info {
  font-size: 0.9rem;
  color: #666;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

/* (アイコン用の仮スタイル、後で本物のアイコンに差し替え) */
.info-item i {
  margin-right: 0.5rem;
}
.icon-calendar::before { content: '📅'; }
.icon-location::before { content: '📍'; }

</style>