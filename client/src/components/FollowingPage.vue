<template>
  <div>
      <main-navbar></main-navbar>
      <scale-loader class="scale-loader" v-if="!releaseValues.length" :loading="loading" :color="color" :size="size"></scale-loader>
      <div class="grid-list">
        <div v-for="data in releaseValues" :key="data[0]" class="p-4 relative flex-col items-center">
          <div v-if="data[0] != null">
            <router-link :to="'/album/' + data[0]" v-if="data[2] == 'album'">
              <p class="font-bold mt-2">{{ data[1] }}</p>
              <p class="text-gray-600">{{ data[3] }}</p>
              <img :src="data[4]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
              <router-link :to="'/artist/' + data[5][0]" class="p-4 flex flex-col items-center artist-small-view">
                <img class="artist-img" :src="data[5][2]" alt="Image"> 
                <p class="font-bold">{{ data[5][1] }}</p>
              </router-link>
            </router-link>
            <div v-else>
              <p class="font-bold mt-2">{{ data[1] }}</p>
              <p class="text-gray-600">{{ data[3] }}</p>
              <img :src="data[4]" alt="Image" class="max-w-full h-auto w-64 md:w-48 lg:w-32 xl:w-24 mb-2 mx-auto"> 
              <router-link :to="'/artist/' + data[5][0]" class="p-4 flex flex-col items-center artist-small-view">
                <img class="artist-img" :src="data[5][2]" alt="Image"> 
                <p class="font-bold">{{ data[5][1] }}</p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="any-release-artist-div" v-if="artistsFollowedWithoutRelease.length">
        <h2 class="text-2xl font-extrabold">Artist(s) without any releases for 1 year</h2>
        <div class="grid-list">
        <router-link v-for="data in artistsFollowedWithoutRelease" :key="data[5]" :to="'/artist/' + data[5]" class="p-4 flex flex-col items-center">
          <img class="artist-img-without" :src="data[7]" alt="Image"> 
          <p class="font-bold">{{ data[6] }}</p>
        </router-link>
      </div> 
      </div>

  </div>
</template>

<script>
import axios from 'axios';
import MainNavbar from './MainNavbar.vue'
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue';

export default {
components: {
  "main-navbar": MainNavbar,
  ScaleLoader,
},
data() {
  return {
    releaseValues: [],
    artistsFollowedWithoutRelease: []
  };
},
created(){
  const userId = localStorage.getItem('jwt_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;

  axios.get('http://localhost:3001/list?list=2')
    .then(response => {
      console.log(response)
      const allData = response.data;
      if (Array.isArray(allData) && allData.length > 0) {
        const { withoutR, withR } = allData.reduce((ret, data) => {
          if (data.slice(0, 5).some(item => item === null)) {
            ret.withoutR.push(data.slice(0, 5).concat(data[5]));
          } else {
            ret.withR.push(data);
          }
          return ret;
        }, { withoutR: [], withR: [] });
        this.releaseValues = withR;
        console.log(withoutR)
        this.artistsFollowedWithoutRelease = withoutR;
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
};
</script>
<style scoped>
@import '../assets/styles/list-style.css';
</style>
  