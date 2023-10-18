<template>
  <div>
    <div>
      <main-navbar></main-navbar>
      <div id="main-div">
        <div id="left-side" class="justify-center">
            <div class="flex w-full justify-center">
                <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
                <div v-else>
                  <img :src="albumData[3]" alt="Album cover" class="cover-album">
                  <h1 class="text-2xl font-bold">{{ albumData[1] }}</h1>
                  <router-link :to="'/artist/' + albumData[2][0]">
                    <p class="text-xl">{{ albumData[2][1] }}</p>
                  </router-link>
                  <span class="font-semibold">{{ albumData[7] }}</span>
                  <p class="text-lg">{{ albumData[6] }} - {{ albumData[4] }}</p>
                  <div v-if="isAuth">
                    <a class="text-white hover:text-blue-300" href="#" @click="addAlbumToList(0)">
                      <i class="fa-solid fa-folder-plus fa-2xl icon-add-album"></i>
                    </a>
                    <a class="text-white hover:text-blue-300" href="#" @click="addAlbumToList(1)">
                      <i class="fa-solid fa-record-vinyl fa-2xl icon-add-album"></i>
                    </a>
                  </div>
                </div>
            </div>
        </div>
        <div id="right-side" class="justify-center">
            <div class="w-full flex justify-center">
              <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
              <div v-else>
                <p class="font-semibold">Tracklist :</p>
                <ul>
                  <li v-for="(track, i) in albumData[8]" :key="i">
                    #{{track.track_number}} - {{track.name}}
                  </li>
                </ul>
                <div class="mt-4 items-center justify-center" >
                  <div class="items-center justify-center" id="spotifyPlayerDiv"></div>
                </div>
              </div>
            </div>
        </div>
    </div>
    </div>
  </div>
</template>

  
<script>
import axios from 'axios';
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue';
import MainNavbar from './MainNavbar.vue'
export default {
  components: {
    "main-navbar": MainNavbar,
    ScaleLoader, 
  },
  data() {
    return {
      albumData: [],
      isAuth: false,
    };
  },
  created(){
    const isAuthToken = localStorage.getItem('jwt_token');
    if(isAuthToken){
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }

    const albumId = this.$route.params.id;
    this.getAlbumData(albumId); 
  },
  methods: {
    getAlbumData(albumId) {
      axios.get(`http://localhost:3001/get-album?albumId=${albumId}`)
        .then(response => {
          this.albumData = response.data;
          //load random sound
          const randomTrack = response.data[8][Math.floor(Math.random() * response.data[8].length)];
          this.loadSpotifyPlayer(randomTrack.id)
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    loadSpotifyPlayer(trackId){
      //wait for vuejs rerender the page and the full loading of the data
      this.$nextTick(() => {
        const spotifyDiv = document.getElementById('spotifyPlayerDiv');
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/track/${trackId}`;
        spotifyDiv.appendChild(iframe);
      })
    },

    /**
     * Add album to either the listen list or the wish list of the user
     * @param {Integer} arg 0 if user wants to add album to his wish list and 1 if he wants to add to it to his listen list
     */
     addAlbumToList(list){
      const userId = localStorage.getItem('jwt_token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${userId}`;
      //required data to show the album in lists : id of album, name, id of main artist, cover and release date
      //only the id will be used if the album is already in the db
      const albumDataToInsertInDB = [this.albumData[0],this.albumData[1],this.albumData[2][0],this.albumData[3],this.albumData[4]]
      axios.post('http://localhost:3001/add-album-to-list', {albumDataToInsertInDB,list})
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.error(error);
        }
      );
    },
  },
};
</script>

<style scoped>
@import '../assets/styles/album-style.css';
</style>

