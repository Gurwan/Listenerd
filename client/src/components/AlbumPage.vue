<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <scale-loader v-if="!albumData.length" :loading="loading" :color="color" :size="size"></scale-loader>
    <div v-else>
      <div class="md:flex md:items-center md:space-x-12">
        <div class="md:w-1/2">
          <img :src="albumData[3]" alt="Album cover" class="w-96 h-96 rounded-full mb-4">
          <h1 class="text-2xl font-bold">{{ albumData[1] }}</h1>
          <router-link :to="'/artist/' + albumData[5]">
            <p class="text-xl">{{ albumData[2] }}</p>
          </router-link>
          <p class="text-lg">{{ albumData[6] }} - {{ albumData[4] }}</p>

          <div class="mt-4">
            <span class="font-semibold">{{ albumData[7] }}</span>
          </div>
        </div>

        <div class="md:w-1/2 mt-4 md:mt-0">
          <p class="font-semibold">Tracklist :</p>
          <ul>
            <li v-for="(track, i) in albumData[8]" :key="i">
              {{ track.position }} - {{ track.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

  
<script>
import axios from 'axios';
import ScaleLoader from 'vue-spinner/src/ScaleLoader.vue'

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
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
  },
  components: {
    ScaleLoader, 
  },
};
</script>
