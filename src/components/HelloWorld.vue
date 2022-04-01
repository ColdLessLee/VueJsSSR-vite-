<script setup>

defineProps({
  msg: String
})

</script>

<template>
  <h1>{{ $props.msg }}</h1>

  
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
