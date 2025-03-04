<template>
  <HomeMap />
</template>

<script>
import HomeMap from './components/HomeMap.vue'

export default {
  name: 'App',
  components: {
    HomeMap
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
