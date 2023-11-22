<template>
    <div v-if="flashMessage">
      <p id="message-p">{{ flashMessage }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: ['flashMessage'],
  };
  </script>
  <style scoped>
  @import '../assets/styles/flash-style.css';
  </style>