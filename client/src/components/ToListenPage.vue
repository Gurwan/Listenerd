<template>
  <div>
      <main-navbar></main-navbar>
      <div class="grid-list">
        <router-link v-for="data in albumsValues" :key="data[0]" :to="'/album/' + data[0]" class="p-4 flex flex-col items-center">
          <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
          <p class="font-bold">{{ data[1] }}</p>
          <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
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
    albumsValues: [],
  };
},
created(){
  const userId = localStorage.getItem('jwt_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

  axios.get('http://localhost:3001/user-list?list=0')
    .then(response => {
      const allData = response.data;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = allData;
      } else {
        console.error('API data error');
      }
    })
    .catch(error => {
        if(error != null){
          this.$router.push('/logout') 
        }
    });
},
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>
  