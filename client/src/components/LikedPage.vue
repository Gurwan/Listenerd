<template>
  <div>
      <main-navbar></main-navbar>
      <div class="filter-bar">
        <div class="filterby-div">
          <p>FILTER BY</p>
          <select class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected value="">YEAR</option>
            <option></option>
          </select>
          <select class="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected value="">ARTIST</option>
            <option></option>
          </select>
        </div>
        <div class="sortby-div">
          <p>SORT BY</p>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(1)">Title</button>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(4)">Release date</button>
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center" @click="sortBy(5)">Your rating</button>
        </div>
      </div>
      <div class="grid-list">
        <router-link v-for="data in sortAlbumsList" :key="data[0]" :to="'/album/' + data[0]" class="p-4 flex flex-col items-center">
          <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
          <p class="font-bold">{{ data[1] }}</p>
          <p class="text-gray-600">{{ data[2][1] }} - {{ data[4] }}</p>
          <p v-if="data[5] != -1 && params.scale != 'empty'" class="font-bold rate-value-id">{{ data[5] }} {{ params.scale }}</p>
          <p v-if="data[5] != -1 && params.scale == 'empty'" class="font-bold rate-value-id">{{ data[5] }}</p>
        </router-link>
      </div>
      <div v-if="sortAlbumsList.length">
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
    params: null,
    sort: {by: null, order:'asc'}
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
  computed: {
    sortAlbumsList(){
      return this.sortList();
    }
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
    },
    sortBy(arg){
      if(arg == this.sort.by){
        if(this.sort.order == 'asc'){
          this.sort.order = 'desc';
        } else {
          this.sort.order = 'asc';
        }
      } else {
        this.sort.by = arg;
        this.sort.order = 'asc';
      }
    },
    sortList(){
      if(this.sort.by == null){
        return this.albumsValues;
      } else {
        return this.albumsValues.slice().sort((a,b) => {
          let rateA = a[this.sort.by];
          let rateB = b[this.sort.by];

          if(this.sort.by == 5){
            if(this.sort.order == 'asc'){
              return rateA - rateB;
            } else {
              return rateB - rateA;
            }
          } else {
            if(this.sort.order == 'asc'){
              return rateA.localeCompare(rateB);
            } else {
              return -(rateA.localeCompare(rateB));
            }
          }
        })
      }
    }
  }
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>