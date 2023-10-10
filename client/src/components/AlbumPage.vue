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
                  <router-link :to="'/artist/' + albumData[5]">
                    <p class="text-xl">{{ albumData[2] }}</p>
                  </router-link>
                  <span class="font-semibold">{{ albumData[7] }}</span>
                  <p class="text-lg">{{ albumData[6] }} - {{ albumData[4] }}</p>

                  <div class="mt-4 items-center justify-center">
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
                    #{{track.position}} - {{track.title}}
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
  created() {
    const albumId = this.$route.params.id;
    this.getAlbumData(albumId); 
  },
  methods: {
    getAlbumData(albumId) {
      axios.get(`http://localhost:3001/discogs-album?albumId=${albumId}`)
        .then(response => {
          this.albumData = response.data;
          this.getAccessTokenSpotify();
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    getAccessTokenSpotify(){
      axios.get(`http://localhost:3001/get-spotify-access-token`)
        .then(response => {
          this.loadSpotifyPlayer(response.data);
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
    loadSpotifyPlayer(accessTokenSpotify) {
      const albumName = this.albumData[1];
      const artistName = this.albumData[2]
      axios.get(`https://api.spotify.com/v1/search?q=${albumName}+${artistName}&type=album`, {
          headers: {
            Authorization: `Bearer ${accessTokenSpotify}`,
          },
        })
        .then((response) => {
          const albumIdSpotify = response.data.albums.items[0].id;
          this.getRandomTrackOfAlbum(albumIdSpotify,accessTokenSpotify);
        })
        .catch((error) => {
          console.error('Spotify API error', error);
        });
    },
    getRandomTrackOfAlbum(albumIdSpotify,accessTokenSpotify) {
      axios.get(`https://api.spotify.com/v1/albums/${albumIdSpotify}/tracks?limit=20`, {
          headers: {
            Authorization: `Bearer ${accessTokenSpotify}`,
          },
        })
        .then((response) => {
          const randomTrack = response.data.items[Math.floor(Math.random() * response.data.items.length)];
          const spotifyDiv = document.getElementById('spotifyPlayerDiv');
          const iframe = document.createElement('iframe');
          iframe.src = `https://open.spotify.com/embed/track/${randomTrack.id}`;
          iframe.classList = "w-96 h-48"
          spotifyDiv.appendChild(iframe);
        })
        .catch((error) => {
          console.error('Spotify API error', error);
        });
    },
  },
  components: {
    ScaleLoader, 
  },
};
</script>
