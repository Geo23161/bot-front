<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<style scoped >
.img_all {
  background-size: cover;
  background-position: center;
}

.g_ac {
  transition: all .2s ease-in-out;
}

.g_ac:active {
  transform: scale(1.2);
}
</style>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>
