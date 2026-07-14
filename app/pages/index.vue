<template>
  <div class="page">
    <FamilyBackground />

    <!-- Header -->
    <header class="header">
      <div class="header__logo">
        <span class="header__icon">❦</span>
        <span class="header__title">Семейное дерево</span>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <h1 class="hero__title">Семья Петросян</h1>
      <p class="hero__subtitle">
        История нашей семьи насчитывает более пяти поколений
        и объединяет свыше 100 человек.
      </p>
      <p class="hero__description">
        Этот сайт создан, чтобы сохранить память о наших предках
        и передать её будущим поколениям.
      </p>
      <div class="hero__divider">
        <span class="hero__divider-ornament">❦</span>
      </div>
      <p class="hero__hint">Начало семейного дерева</p>
    </section>

    <!-- Family Tree -->
    <main class="tree-section">
      <FamilyTree :members="members" />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__content">
        <span class="footer__ornament">❦</span>
        <p class="footer__text">
          С любовью и уважением к нашим корням
        </p>
        <p class="footer__year">© {{ currentYear }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { FamilyMember } from '~/types/family';
import familyData from '~/data/family.json';
import FamilyTree from '~/components/family-tree/FamilyTree.vue';
import FamilyBackground from '~/components/family-tree/FamilyBackground.vue';

const members = ref<FamilyMember[]>(familyData as FamilyMember[]);
const currentYear = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #3e2d1e;
  font-family: 'Inter', sans-serif;
}

.header {
  padding: 24px 40px;
  display: flex;
  justify-content: center;

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    font-size: 24px;
    color: #b8860b;
  }

  &__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 1.5px;
    color: #3e2d1e;
    text-transform: uppercase;
  }
}

.hero {
  padding: 60px 40px 40px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;

  &__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 64px;
    font-weight: 500;
    color: #3e2d1e;
    margin: 0 0 16px;
    letter-spacing: 2px;
    text-shadow: 0 2px 12px rgba(62, 45, 30, 0.2);
  }

  &__subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 500;
    font-style: italic;
    color: #5a4632;
    margin: 0 0 12px;
    line-height: 1.5;
  }

  &__description {
    font-size: 15px;
    color: #6b5440;
    line-height: 1.7;
    margin: 0 0 28px;
  }

  &__divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;

    &::before,
    &::after {
      content: '';
      flex: 1;
      max-width: 120px;
      height: 1px;
      background: linear-gradient(
        to right,
        transparent,
        rgba(184, 134, 11, 0.5),
        transparent
      );
    }
  }

  &__divider-ornament {
    margin: 0 20px;
    color: #b8860b;
    font-size: 20px;
  }

  &__hint {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-style: italic;
    color: #8a7258;
    letter-spacing: 1px;
    margin: 0;
  }
}

.tree-section {
  flex: 1;
  position: relative;
  height: calc(100vh - 120px);
  min-height: 600px;
  margin: 0 24px 24px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(245, 235, 215, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(184, 134, 11, 0.2);
  box-shadow: 0 8px 40px rgba(62, 45, 30, 0.2);
}

.footer {
  padding: 30px 40px;
  text-align: center;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__ornament {
    color: #b8860b;
    font-size: 18px;
  }

  &__text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-style: italic;
    color: #5a4632;
    margin: 0;
  }

  &__year {
    font-size: 12px;
    color: #8a7258;
    letter-spacing: 2px;
    margin: 0;
  }
}
</style>