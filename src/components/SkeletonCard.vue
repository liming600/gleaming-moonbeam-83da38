<script setup lang="ts">
</script>

<template>
  <div class="skeleton-card">
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-info">
        <div class="skeleton-name"></div>
        <div class="skeleton-time"></div>
      </div>
    </div>
    <div class="skeleton-content"></div>
    <div class="skeleton-image"></div>
    <div class="skeleton-tags">
      <div class="skeleton-tag"></div>
      <div class="skeleton-tag"></div>
    </div>
    <div class="skeleton-actions">
      <div class="skeleton-action"></div>
      <div class="skeleton-action"></div>
      <div class="skeleton-action"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  animation: shimmer 1.5s infinite;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-name {
  height: 16px;
  width: 60%;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-time {
  height: 12px;
  width: 40%;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-content {
  height: 40px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-image {
  height: 200px;
  border-radius: 16px;
  margin-bottom: 12px;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.skeleton-tag {
  height: 24px;
  width: 60px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

.skeleton-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #F5F5F4;
}

.skeleton-action {
  height: 32px;
  width: 60px;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    rgba(229, 229, 229, 0.3) 25%,
    rgba(229, 229, 229, 0.6) 50%,
    rgba(229, 229, 229, 0.3) 75%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>