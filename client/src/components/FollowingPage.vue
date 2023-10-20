<template>
  <div>
      <main-navbar></main-navbar>
      <div class="grid-list-artist">
        <router-link v-for="data in artistValues" :key="data[0]" :to="'/artist/' + data[0]" class="p-4 flex flex-col items-center">
          <img class="artist-img" :src="data[2]" alt="Image"> 
          <p class="font-bold">{{ data[1] }}</p>
        </router-link>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
import MainNavbar from './MainNavbar.vue'
export default {
components: {
  "main-navbar": MainNavbar
},
data() {
  return {
    artistValues: [],
  };
},
created(){
  const userId = localStorage.getItem('jwt_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

  axios.get('http://localhost:3001/user-list?list=2')
    .then(response => {
      const allData = response.data;
      if (Array.isArray(allData) && allData.length > 0) {
        this.artistValues = allData;
      } else {
        console.error('API data error');
      }
    })
    .catch(error => {
      console.error(error);
    });
},
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>
  