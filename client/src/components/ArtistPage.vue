<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <sync-loader v-if="!artistData.length" :loading="loading" :color="color" :size="size"></sync-loader>
    <div v-else>
        <img :src="artistData[2]" alt="Artist picture" class="w-96 h-96 rounded-full mb-4">
        <h1 class="text-2xl font-bold">{{ artistData[1] }}</h1> 
        <p class="text-lg">{{ artistData[3] }}</p> 
    </div>
  </div>
</template>  
  
<script>
import axios from 'axios';
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

export default {
  data() {
    return {
      artistData: [],
    };
  },
  created() {
    const artistId = this.$route.params.id;
    this.getArtistData(artistId); 
  },
  methods: {
    getArtistData(artistId) {
      axios.get(`http://localhost:3001/discogs-artist?artistId=${artistId}`)
        .then(response => {
          this.artistData = response.data;
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
  },
  components: {
    SyncLoader, 
  },
};
</script>
