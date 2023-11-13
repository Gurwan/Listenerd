<template>
  <div>
      <main-navbar></main-navbar>
      <div class="grid-list">
        <router-link v-for="data in albumsValues" :key="data[0]" :to="'/album/' + data[0]" class="p-4 flex flex-col items-center">
          <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
          <p class="font-bold">{{ data[1] }}</p>
          <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
          <p v-if="data[5] != -1 && params.scale != 'empty'" class="font-bold rate-value-id">{{ data[5] }} {{ params.scale }}</p>
          <p v-if="data[5] != -1 && params.scale == 'empty'" class="font-bold rate-value-id">{{ data[5] }}</p>
        </router-link>
      </div>
      <div v-if="albumsValues.length">
        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="clearLikedList">
          <i style="padding: 1rem;" class="fa-solid fa-trash"></i> <span style="padding:1rem">Clear your liked albums list</span></button>
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
    params: null
  };
},
created(){
  const userId = this.$cookies.get('jwt_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

  axios.get('http://localhost:3001/list?list=1')
    .then(response => {
      this.params = response.data.userParams;
      const allData = response.data.resultLiked;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = allData;
      } else {
        console.error('API data error');
      }
    })
    .catch(error => {
        if(error != null){
          this.$router.push('/logout') 
          console.log(error)
        }
    });
  },
  methods: {
    clearLikedList(){
      const userId = this.$cookies.get('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      axios.delete('http://localhost:3001/liked-list')
      .then(response => {
          console.log(response);
          location.reload();
      })
      .catch(error => {
        if(error != null){
          console.log(error)
          //this.$router.push('/logout') 
        }        
      });
    }
  }
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>