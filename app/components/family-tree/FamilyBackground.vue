<template>
  <div class="family-background">
    <div class="family-background__image" />
    <div class="family-background__overlay" />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.family-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;

  &__image {
    position: absolute;
    inset: -20px;
    background-image: url('~/assets/images/ararat.jpg');
    background-size: cover;
    background-position: center;
    filter: blur(6px) brightness(0.55) saturate(0.8);
    transform: scale(1.05);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        ellipse at center,
        rgba(245, 235, 215, 0.25) 0%,
        rgba(62, 45, 30, 0.55) 100%
      );
  }
}
</style>