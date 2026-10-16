<template>
  <nav class="fixed l-0 flex flex-col w-180 h-full pt-50 pr-10 pl-10 z-99">
    <RouterLink to="/">Home</RouterLink>
  </nav>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'sidebar',
  components: {},
  props: {},
  setup() {},
})
</script>

<style scoped lang="scss"></style>
