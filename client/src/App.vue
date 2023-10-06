<template>
  <div>
    <main-navbar></main-navbar>
    <div class="grid grid-cols-3 gap-4">
      <div v-for="imageUrl in imageUrls" :key="imageUrl" class="bg-gray-200 p-4">
        <img :src="imageUrl" alt="Image" class="max-w-full h-auto">
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
      imageUrls: [],
    };
  },
  mounted() {
    // Faites une requête GET à votre API Express
    axios.get('http://localhost:3001/discogs-trends')
      .then(response => {
        // Récupérez les données renvoyées par l'API
        const allData = response.data;
        if (Array.isArray(allData) && allData.length > 0) {
          const imageUrls = allData.map(data => data[2]);
          this.imageUrls = imageUrls;
        } else {
          console.error('Données de l\'API incorrectes');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la requête à l\'API :', error);
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
  margin-top: 60px;
}
</style>
