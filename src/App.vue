<script setup>
import Aos from 'aos';
import 'aos/dist/aos.css'
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

onMounted(() => {
  Aos.init({
    duration: 1000,
    once: false,
    offset: 100
  })
})

</script>

<template>
  <main>
    <RouterView />
  </main>
</template>