<template>
    <div class="flex flex-col items-center justify-center h-screen">
      <img :src="albumData[3]" alt="Album cover" class="w-96 h-96 rounded-full mb-4">
      <h1 class="text-2xl font-bold">{{ albumData[1] }}</h1> 
      <p class="text-xl">{{ albumData[2] }}</p> 
      <p class="text-lg">{{ albumData[4] }}</p> 
    </div>
</template>  
  
<script>
import axios from 'axios';

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
            console.log(response)
          this.albumData = response.data;
        })
        .catch(error => {
          console.error('API error:', error);
        });
    },
  },
};
</script>
