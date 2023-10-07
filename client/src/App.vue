<template>
  <div>
    <main-navbar @search-text-changed="searchAlbumsArtists"></main-navbar>
    <div class="grid grid-cols-6 gap-4">
      <div v-for="data in albumsValues" :key="data[0]" class="bg-gray-200 p-4 flex flex-col items-center">
        <img :src="data[3]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
        <p class="font-bold">{{ data[2] }}</p>
        <p class="text-gray-600">{{ data[1] }}</p>
      </div>
    </div>
  </div>
</template>


<script>
import MainNavbar from './components/MainNavbar.vue'
import axios from 'axios';

export default {
  name: 'App',
  components: {
    "main-navbar": MainNavbar
  },
  data() {
    return {
      albumsValues: [],
      searchText: '',
    };
  },
  methods: {
    searchAlbumsArtists(searchText) {
      axios.get(`http://localhost:3001/discogs-search?search=${searchText}`)
        .then((response) => this.refreshData(response))
        .catch(error => {
          console.error('API request error :', error);
        });
    },
    refreshData(response) {
      const allData = response.data;
      if (Array.isArray(allData) && allData.length > 0) {
        this.albumsValues = allData;
      } else {
        console.error('API data error');
      }
    }
  },
  mounted() {
    axios.get('http://localhost:3001/discogs-trends')
    .then((response) => this.refreshData(response))
    .catch(error => {
          console.error('API request error :', error);
        });
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
