<script lang="ts" setup>
import { ref } from 'vue';

const count = ref(0)
const increment = () => {
  count.value++
}
</script>

<template>
  <div class="code-tab">
    <h1>Code Tab</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <p>Click the button to increment the count.</p>
  </div>
</template>