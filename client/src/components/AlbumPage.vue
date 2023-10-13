<template>
  <div>
    <div>
      <div class="flex">
        <div class="flex items-center justify-center w-1/2 h-screen">
            <div class="flex w-full h-full items-center justify-center">
                <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
                <div v-else>
                  <img :src="albumData[3]" alt="Album cover" class="w-96 h-96 rounded-full mb-4">
                  <h1 class="text-2xl font-bold">{{ albumData[1] }}</h1>
                  <router-link :to="'/artist/' + albumData[2][0]">
                    <p class="text-xl">{{ albumData[2][1] }}</p>
                  </router-link>
                  <span class="font-semibold">{{ albumData[7] }}</span>
                  <p class="text-lg">{{ albumData[6] }} - {{ albumData[4] }}</p>

                  <div class="mt-4 items-center justify-center" >
                    <div class="items-center justify-center" id="spotifyPlayerDiv"></div>
                  </div>
                </div>
            </div>
        </div>
        <div class="flex items-center justify-center w-1/2 h-screen">
            <div class="w-full h-full flex items-center justify-center">
              <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
              <div v-else>
                <p class="font-semibold">Tracklist :</p>
                <ul>
                  <li v-for="(track, i) in albumData[8]" :key="i">
                    #{{track.track_number}} - {{track.name}}
                  </li>
                </ul>
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

export default {
  data() {
    return {
      albumData: [],
    };
  },
  created(){
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
        iframe.classList = "w-96 h-48"
        spotifyDiv.appendChild(iframe);
      })
    }
  },
  components: {
    ScaleLoader, 
  },
};
</script>
