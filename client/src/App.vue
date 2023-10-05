<template>
  <div>
    <main-navbar></main-navbar>
  </div>
</template>

<script>
import MainNavbar from './components/MainNavbar.vue'

export default {
  name: 'App',
  components: {
    "main-navbar": MainNavbar
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
